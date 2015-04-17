using System.Configuration;
using System.Data.SqlClient;
using Nancy;
using Dapper;
using Newtonsoft.Json;

namespace crash_statistics {

    public class Statistics : NancyModule {

        public Statistics()
        {
            Get["/stats/{criteria?}", true] = async (_, ctx) =>
                {
                    string weather =
                        string.Format(
                            "select weather_condition, count(*) from crashlocation where {0} group by weather_condition",
                            _.criteria);

                    var roads =
                        string.Format(
                            "select road_condition, count(*) from crash_points where {0} group by road_condition",
                            _.criteria);

                    var days =
                        string.Format(
                            "select day, count(*) from crash_points where {0} group by day",
                            _.criteria);

                    var hours =
                        string.Format(
                            "select hour, count(*) from crash_points where {0} group by hour",
                            _.criteria);

                    var cause =
                        string.Format(
                            "select driver.contributing_cause, count(*) from Driver inner join crash_points on crash_points.crash_id = driver.driver_id where {0} group by driver.contributing_cause",
                            _.criteria);

                    var distractions =
                        string.Format(
                            "select driver.driver_distraction, count(*) from Driver inner join crash_points on crash_points.crash_id = driver.driver_id where {0} group by driver.driver_distraction",
                            _.criteria);


                    var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["dev"].ConnectionString);
                    var weatherData = await connection.QueryAsync(weather);

                    return JsonConvert.SerializeObject(weatherData);
                };
        }
    }

}