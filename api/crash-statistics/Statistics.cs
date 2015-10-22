using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using crash_statistics.Models;
using Dapper;
using Nancy;
using Nancy.ModelBinding;
using Newtonsoft.Json;

namespace crash_statistics
{
    public class Statistics : NancyModule
    {
        public Statistics()
        {
            Post["/stats", true] = async (_, ctx) =>
            {
                const string sql =
                    @"(select 'weather' as type, weather_condition as label, count(*) as occurances from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by weather_condition) union 
(select 'road' as type, road_condition as label, count(*) as occurances from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by road_condition) union 
(select 'day' as type, cast(crash_day as varchar) as label, count(*) as occurances from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by crash_day) union 
(select 'hour' as type, cast(crash_hour as varchar) as label, count(*) as occurances from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by crash_hour) union 
(select 'cause' as type, DDACTS.DDACTSadmin.Driver.contributing_cause as label, count(*) as occurances from DDACTS.DDACTSadmin.Driver inner join DDACTS.DDACTSadmin.CRASHLOCATION on DDACTS.DDACTSadmin.CRASHLOCATION.crash_id = DDACTS.DDACTSadmin.Driver.driver_id where {0} group by DDACTS.DDACTSadmin.Driver.contributing_cause) union 
(select 'distraction' as type, DDACTS.DDACTSadmin.Driver.driver_distraction as label, count(*) as occurances from DDACTS.DDACTSadmin.Driver inner join DDACTS.DDACTSadmin.CRASHLOCATION on DDACTS.DDACTSadmin.CRASHLOCATION.crash_id = DDACTS.DDACTSadmin.Driver.driver_id where {0} group by DDACTS.DDACTSadmin.Driver.driver_distraction)";
                var criteria = this.Bind<PostData>();

                IEnumerable<Row> results;
                IEnumerable<Row> comparison = null;

                try
                {
                    using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["dev"].ConnectionString))
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
                    return JsonConvert.SerializeObject(ex.Message);
                }

                results = results.ToArray();

                Func<object, object> convertToDay = pair =>
                {
                    var key = int.Parse(pair.ToString());

                    switch (key)
                    {
                        case 1:
                            return DayOfWeek.Sunday;
                        case 2:
                            return DayOfWeek.Monday;
                        case 3:
                            return DayOfWeek.Tuesday;
                        case 4:
                            return DayOfWeek.Wednesday;
                        case 5:
                            return DayOfWeek.Thursday;
                        case 6:
                            return DayOfWeek.Friday;
                        case 7:
                            return DayOfWeek.Saturday;
                    }

                    return "";
                };

                Func<object, object> convertToNumber = str =>
                {
                    int number;

                    return int.TryParse(str.ToString(), out number) ? number : str;
                };

                var weather = new Chart();
                var cause = new Chart();
                var days = new Chart();
                var distractions = new Chart();
                var time = new Chart();
                var road = new Chart();

                if (comparison != null && comparison.Any())
                {
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
                            .Select(x => new Row(x.Occurances, convertToDay(x.Label), x.Type)),
                        comparison.Where(x => x.Type == "day" && x.Label != null)
                            .Select(x => new Row(x.Occurances, convertToDay(x.Label), x.Type))
                    }, "days", "pie");

                    distractions = new Chart(new[]
                    {
                        results.Where(x => x.Type == "distraction" && x.Label != null),
                        comparison.Where(x => x.Type == "distraction" && x.Label != null)
                    }, "distractions", "bar");

                    time = new Chart(new[]
                    {
                        results.Where(x => x.Type == "hour" && x.Label != null)
                               .Select(x => new Row(x.Occurances, convertToNumber(x.Label), x.Type)),
                        comparison.Where(x => x.Type == "hour" && x.Label != null)
                                  .Select(x => new Row(x.Occurances, convertToNumber(x.Label), x.Type))   
                    }, "time", "line");

                    road = new Chart(new[]
                    {
                        results.Where(x => x.Type == "road" && x.Label != null),
                        comparison.Where(x => x.Type == "road" && x.Label != null)
                    }, "road", "pie");
                }
                else
                {
                    weather = new Chart(results.Where(x => x.Type == "weather" && x.Label != null).ToArray(),
                        "weather", "pie");
                    cause = new Chart(results.Where(x => x.Type == "cause" && x.Label != null), "factors", "pie");
                    days = new Chart(results.Where(x => x.Type == "day" && x.Label != null)
                                .Select(x => new Row(x.Occurances, convertToDay(x.Label), x.Type)), "days", "pie");
                    distractions = new Chart(results.Where(x => x.Type == "distraction" && x.Label != null),
                        "distractions", "bar");
                    time = new Chart(results.Where(x => x.Type == "hour" && x.Label != null)
                                            .Select(x => new Row(x.Occurances, convertToNumber(x.Label), x.Type)), "time", "line");
                    road = new Chart(results.Where(x => x.Type == "road" && x.Label != null), "road", "pie");
                }

                var result = new Result
                {
                    Weather = weather,
                    Cause = cause,
                    Days = days,
                    Distractions = distractions,
                    Time = time,
                    Road = road
                };

                return JsonConvert.SerializeObject(result);
            };
        }
    }
}