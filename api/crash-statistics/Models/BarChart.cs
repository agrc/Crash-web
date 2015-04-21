using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace crash_statistics.Models {

    public class BarChart : Chart {
        public BarChart(IEnumerable<Row> rows, string selector) : base(rows, selector)
        {
        }

        [JsonProperty(PropertyName = "categories")]
        public string[] Categories { get { return Data.Select(x => x[0].ToString()).ToArray(); } }

        public override string Type { get { return "bar"; } } 
    }

}