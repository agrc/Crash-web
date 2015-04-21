using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace crash_statistics.Models {

    public abstract class Chart {
        private readonly IEnumerable<Row> _rows;

        protected Chart(IEnumerable<Row> rows, string selector)
        {
            _rows = rows;
            Selector = selector;
        }

        [JsonProperty(PropertyName = "data")]
        public virtual IEnumerable<ArrayList> Data
        {
            get { return _rows.Select(x => new ArrayList {x.Label.Trim(), x.Occurances}); }
        }

        [JsonProperty(PropertyName = "selector")]
        public string Selector { get; set; }

        [JsonProperty(PropertyName = "type")]
        public abstract string Type { get; }
    }

}