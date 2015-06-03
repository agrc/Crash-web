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
                    using (
                        var connection =
                            new SqlConnection(ConfigurationManager.ConnectionStrings["dev"].ConnectionString))
                    {
                        results = await connection.QueryAsync<Row>(string.Format(sql, criteria.Sql));

                        if (!string.IsNullOrEmpty(criteria.Comparison))
                        {
                            comparison = await connection.QueryAsync<Row>(string.Format(sql, criteria.Comparison));
                        }
                    }
                }
                catch (Exception ex)
                {
                    return JsonConvert.SerializeObject(ex.Message);
                }

                results = results.ToArray();

                Func<string, string> convertToDay = pair =>
                {
                    var key = int.Parse(pair);

                    switch (key)
                    {
                        case 1:
                            return "Sunday";
                        case 2:
                            return "Monday";
                        case 3:
                            return "Tuesday";
                        case 4:
                            return "Wednesday";
                        case 5:
                            return "Thursday";
                        case 6:
                            return "Friday";
                        case 7:
                            return "Saturday";
                    }

                    return "";
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
                        results.Where(x => x.Type == "hour" && x.Label != null),
                        results.Where(x => x.Type == "hour" && x.Label != null)
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
                    days =new Chart(results.Where(x => x.Type == "day" && x.Label != null)
                                .Select(x => new Row(x.Occurances, convertToDay(x.Label), x.Type)), "days", "pie");
                    distractions = new Chart(results.Where(x => x.Type == "distraction" && x.Label != null),
                        "distractions", "bar");
                    time = new Chart(results.Where(x => x.Type == "hour" && x.Label != null), "time", "line");
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