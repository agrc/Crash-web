﻿using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using Dapper;
using Nancy;
using Newtonsoft.Json;
using crash_statistics.Models;
using Nancy.ModelBinding;

namespace crash_statistics {

    public class Statistics : NancyModule {
        public Statistics()
        {
            Post["/stats", true] = async (_, ctx) =>
                {
                    const string sql = @"(select 'weather' as type, weather_condition as label, count(*) as occurances from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by weather_condition) union 
(select 'road' as type, road_condition as label, count(*) as occurances from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by road_condition) union 
(select 'day' as type, cast(crash_day as varchar) as label, count(*) as occurances from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by crash_day) union 
(select 'hour' as type, cast(crash_hour as varchar) as label, count(*) as occurances from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by crash_hour) union 
(select 'cause' as type, DDACTS.DDACTSadmin.Driver.contributing_cause as label, count(*) as occurances from DDACTS.DDACTSadmin.Driver inner join DDACTS.DDACTSadmin.CRASHLOCATION on DDACTS.DDACTSadmin.CRASHLOCATION.crash_id = DDACTS.DDACTSadmin.Driver.driver_id where {0} group by DDACTS.DDACTSadmin.Driver.contributing_cause) union 
(select 'distraction' as type, DDACTS.DDACTSadmin.Driver.driver_distraction as label, count(*) as occurances from DDACTS.DDACTSadmin.Driver inner join DDACTS.DDACTSadmin.CRASHLOCATION on DDACTS.DDACTSadmin.CRASHLOCATION.crash_id = DDACTS.DDACTSadmin.Driver.driver_id where {0} group by DDACTS.DDACTSadmin.Driver.driver_distraction)";
                    var criteria = this.Bind<PostData>();

                    IEnumerable<Row> results;

                    try
                    {
                        using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["dev"].ConnectionString))
                        {
                            results = await connection.QueryAsync<Row>(string.Format(sql, criteria.Sql));
                        }
                    }
                    catch (Exception ex)
                    {
                        return JsonConvert.SerializeObject(ex.Message);
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