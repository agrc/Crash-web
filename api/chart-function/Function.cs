using chart_function.Models;
using Dapper;
using Google.Cloud.Functions.Framework;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace chart_function
{
    public class Function : IHttpFunction
    {
        private const string sql = @"(select 'weather' as type, weather_condition as label, count(*) as occurrences from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by weather_condition) union
(select 'road' as type, road_condition as label, count(*) as occurrences from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by road_condition) union
(select 'day' as type, cast(crash_day as varchar) as label, count(*) as occurrences from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by crash_day) union
(select 'hour' as type, cast(crash_hour as varchar) as label, count(*) as occurrences from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by crash_hour) union
(select 'cause' as type, DDACTS.DDACTSadmin.Driver.contributing_cause as label, count(*) as occurrences from DDACTS.DDACTSadmin.Driver inner join DDACTS.DDACTSadmin.CRASHLOCATION on DDACTS.DDACTSadmin.CRASHLOCATION.crash_id = DDACTS.DDACTSadmin.Driver.driver_id where {0} group by DDACTS.DDACTSadmin.Driver.contributing_cause) union
(select 'distraction' as type, DDACTS.DDACTSadmin.Driver.driver_distraction as label, count(*) as occurrences from DDACTS.DDACTSadmin.Driver inner join DDACTS.DDACTSadmin.CRASHLOCATION on DDACTS.DDACTSadmin.CRASHLOCATION.crash_id = DDACTS.DDACTSadmin.Driver.driver_id where {0} group by DDACTS.DDACTSadmin.Driver.driver_distraction)";

        public Function(ILogger<Function> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _options = new(JsonSerializerDefaults.Web);
        }

        private readonly ILogger<Function> _logger;
        private readonly IConfiguration _configuration;
        private readonly JsonSerializerOptions _options;

        /// <summary>
        /// Logic for your function goes here.
        /// </summary>
        /// <param name="context">The HTTP context, containing the request and the response.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        public async Task HandleAsync(HttpContext context)
        {
            context.Response.Headers.Append("Access-Control-Allow-Origin", "*");

            if (HttpMethods.IsOptions(context.Request.Method))
            {
                context.Response.Headers.Append("Access-Control-Allow-Methods", "GET");
                context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type");
                context.Response.Headers.Append("Access-Control-Max-Age", "3600");
                context.Response.StatusCode = 204;

                return;
            }

            if (context.Request.Method != "POST")
            {
                context.Response.StatusCode = 404;
                _logger.LogWarning("bad request, wrong verb");

                return;
            }

            if (!context.Request.HasFormContentType)
            {
                context.Response.StatusCode = 400;
                _logger.LogWarning("bad request, wrong content type");

                return;
            }

            var form = context.Request.Form;
            if (form is null || form.Count < 1) {
                context.Response.StatusCode = 400;
                _logger.LogWarning("bad request, form is empty");

                return;
            }

            if (!form.ContainsKey("sql"))
            {
                context.Response.StatusCode = 400;
                _logger.LogWarning("bad request, missing form value");

                return;
            }

            if (!form.TryGetValue("sql", out var sqlString))
            {
                context.Response.StatusCode = 400;
                _logger.LogWarning("bad request, missing form value");

                return;
            }

            string comparisonString = string.Empty;

            if (form?.Count > 0 && form.ContainsKey("Comparison"))
            {
                form.TryGetValue("Comparison", out var compareString);
                comparisonString = compareString;
            }

            var criteria = new PostData
            {
                Sql = sqlString,
                Comparison = comparisonString
            };

            IEnumerable<Row> results = Enumerable.Empty<Row>();
            IEnumerable<Row> comparison = Enumerable.Empty<Row>();

            try
            {
                var connectionString = _configuration["ConnectionStrings:main"];
                using (var connection = new SqlConnection(connectionString))
                {
                    criteria.Sql = criteria.Sql.Replace("crash_date", "CRASHLOCATION.crash_date");
                    results = await connection.QueryAsync<Row>(string.Format(sql, criteria.Sql));

                    if (!string.IsNullOrEmpty(criteria.Comparison))
                    {
                        criteria.Comparison = criteria.Comparison.Replace("crash_date", "CRASHLOCATION.crash_date");
                        comparison = await connection.QueryAsync<Row>(string.Format(sql, criteria.Comparison));
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex, "error accessing the database or quering the database");

                await context.Response.WriteAsync("Database issue");

                return;
            }

            results = results.ToArray();

            object convertToDay(object pair)
            {
                return int.Parse(pair?.ToString() ?? "-1") switch
                {
                    1 => DayOfWeek.Sunday,
                    2 => DayOfWeek.Monday,
                    3 => DayOfWeek.Tuesday,
                    4 => DayOfWeek.Wednesday,
                    5 => DayOfWeek.Thursday,
                    6 => DayOfWeek.Friday,
                    7 => DayOfWeek.Saturday,
                    _ => "",
                };
            }

            object convertToNumber(object str) => int.TryParse(str.ToString(), out int number) ? number : str;

            var weather = new Chart();
            var cause = new Chart();
            var days = new Chart();
            var distractions = new Chart();
            var time = new Chart();
            var road = new Chart();

            if (comparison?.Any() == true)
            {
                _logger.LogInformation("running comparison");

                comparison = comparison.ToArray();

                weather = new Chart(new[]
                {
                        results.Where(x => x.Type == "weather" && x.Label != null).ToArray(),
                        comparison.Where(x => x.Type == "weather" && x.Label != null).ToArray(),
                    }, "weather", "pie");

                cause = new Chart(new[]
                {
                        results.Where(x => x.Type == "cause" && x.Label != null),
                        comparison.Where(x => x.Type == "cause" && x.Label != null)
                    }, "factors", "pie");

                days = new Chart(new[]
                {
                        results.Where(x => x.Type == "day" && x.Label != null)
                            .Select(x => new Row(x.Occurrences, convertToDay(x.Label), x.Type)),
                        comparison.Where(x => x.Type == "day" && x.Label != null)
                            .Select(x => new Row(x.Occurrences, convertToDay(x.Label), x.Type))
                    }, "days", "pie");

                distractions = new Chart(new[]
                {
                        results.Where(x => x.Type == "distraction" && x.Label != null),
                        comparison.Where(x => x.Type == "distraction" && x.Label != null)
                    }, "distractions", "bar");

                time = new Chart(new[]
                {
                        results.Where(x => x.Type == "hour" && x.Label != null)
                               .Select(x => new Row(x.Occurrences, convertToNumber(x.Label), x.Type)),
                        comparison.Where(x => x.Type == "hour" && x.Label != null)
                                  .Select(x => new Row(x.Occurrences, convertToNumber(x.Label), x.Type))
                    }, "time", "line");

                road = new Chart(new[]
                {
                        results.Where(x => x.Type == "road" && x.Label != null),
                        comparison.Where(x => x.Type == "road" && x.Label != null)
                    }, "road", "pie");
            }
            else
            {
                _logger.LogInformation("showing charts");

                weather = new Chart(results.Where(x => x.Type == "weather" && x.Label != null).ToArray(),
                    "weather", "pie");
                cause = new Chart(results.Where(x => x.Type == "cause" && x.Label != null), "factors", "pie");
                days = new Chart(results.Where(x => x.Type == "day" && x.Label != null)
                            .Select(x => new Row(x.Occurrences, convertToDay(x.Label), x.Type)), "days", "pie");
                distractions = new Chart(results.Where(x => x.Type == "distraction" && x.Label != null),
                    "distractions", "bar");
                time = new Chart(results.Where(x => x.Type == "hour" && x.Label != null)
                                        .Select(x => new Row(x.Occurrences, convertToNumber(x.Label), x.Type)), "time", "line");
                road = new Chart(results.Where(x => x.Type == "road" && x.Label != null), "road", "pie");
            }

            var result = new Result
            {
                Weather = weather,
                Cause = cause,
                Day = days,
                Distraction = distractions,
                Time = time,
                Road = road
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(result, _options));
        }
    }
}
