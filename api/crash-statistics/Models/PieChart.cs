using System.Collections.Generic;

namespace crash_statistics.Models {

    public class PieChart : Chart {
        public PieChart(IEnumerable<Row> rows, string selector) : base(rows, selector)
        {
        }

        public override string Type { get { return "pie"; } }
    }

}