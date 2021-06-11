using Google.Cloud.Functions.Framework;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace chart_function
{
    public class Function : IHttpFunction
    {
        const string sql = @"(select 'weather' as type, weather_condition as label, count(*) as occurrences from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by weather_condition) union
(select 'road' as type, road_condition as label, count(*) as occurrences from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by road_condition) union
(select 'day' as type, cast(crash_day as varchar) as label, count(*) as occurrences from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by crash_day) union
(select 'hour' as type, cast(crash_hour as varchar) as label, count(*) as occurrences from DDACTS.DDACTSadmin.CRASHLOCATION where {0} group by crash_hour) union
(select 'cause' as type, DDACTS.DDACTSadmin.Driver.contributing_cause as label, count(*) as occurrences from DDACTS.DDACTSadmin.Driver inner join DDACTS.DDACTSadmin.CRASHLOCATION on DDACTS.DDACTSadmin.CRASHLOCATION.crash_id = DDACTS.DDACTSadmin.Driver.driver_id where {0} group by DDACTS.DDACTSadmin.Driver.contributing_cause) union
(select 'distraction' as type, DDACTS.DDACTSadmin.Driver.driver_distraction as label, count(*) as occurrences from DDACTS.DDACTSadmin.Driver inner join DDACTS.DDACTSadmin.CRASHLOCATION on DDACTS.DDACTSadmin.CRASHLOCATION.crash_id = DDACTS.DDACTSadmin.Driver.driver_id where {0} group by DDACTS.DDACTSadmin.Driver.driver_distraction)";

        /// <summary>
        /// Logic for your function goes here.
        /// </summary>
        /// <param name="context">The HTTP context, containing the request and the response.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        public async Task HandleAsync(HttpContext context)
        {
            if (context.Request.Method != "POST")
            {
                context.Response.StatusCode = 404;

                return;
            }

            if (!context.Request.HasFormContentType)
            {
                context.Response.StatusCode = 400;

                return;
            }

            var form = context.Request.Form;
            if (form?.Count < 1 || !form.ContainsKey("sql"))
            {
                context.Response.StatusCode = 400;

                return;
            }

            if (!form.TryGetValue("sql", out var sql))
            {
                context.Response.StatusCode = 400;

                return;
            }

            await context.Response.WriteAsync(sql);
        }
    }
}
