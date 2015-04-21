using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using Dapper;
using Nancy;
using Newtonsoft.Json;
using crash_statistics.Models;

namespace crash_statistics {

    public class Statistics : NancyModule {
        public Statistics()
        {
            Get["/stats/{criteria?}", true] = async (_, ctx) =>
                {
                    const string sql = "(select 'weather' as type, weather_condition as label, count(*) as occurances from crashlocation where {0} group by weather_condition)  union (select 'road' as type, road_condition as label, count(*) as occurances from crashlocation where {0} group by road_condition) union (select 'day' as type, cast(day as varchar) as label, count(*) as occurances from crashlocation where {0} group by day) union (select 'hour' as type, cast(hour as varchar) as label, count(*) as occurances from crashlocation where {0} group by hour) union (select 'cause' as type, driver.contributing_cause as label, count(*) as occurances from Driver inner join crashlocation on crashlocation.crash_id = driver.driver_id where {0} group by driver.contributing_cause) union (select 'distraction' as type, driver.driver_distraction as label, count(*) as occurances from Driver inner join crashlocation on crashlocation.crash_id = driver.driver_id where {0} group by driver.driver_distraction)";

                    IEnumerable<Row> results;

                    using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["dev"].ConnectionString))
                    {
                        results = await connection.QueryAsync<Row>((string) string.Format(sql, _.criteria));
                    }

                    results = results.ToArray();

                    var result = new Result
                        {
                            Weather =  new PieChart(results.Where(x => x.Type == "weather" && x.Label != null).ToArray(), "weather"),
                            Cause = new PieChart(results.Where(x => x.Type == "cause" && x.Label != null), "factors"),
                            Days = new DayChart(results.Where(x => x.Type == "day" && x.Label != null), "days"),
                            Distractions = new BarChart(results.Where(x => x.Type == "distraction" && x.Label != null), "distractions"),
                            Time = new TimeChart(results.Where(x => x.Type == "hour" && x.Label != null), "time"),
                            Road = new PieChart(results.Where(x => x.Type == "road" && x.Label != null), "road")
                        };

                    return JsonConvert.SerializeObject(result);
                };
        }
    }

}