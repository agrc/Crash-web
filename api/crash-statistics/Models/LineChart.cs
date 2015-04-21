using System.Collections.Generic;

namespace crash_statistics.Models {

    public class LineChart : Chart {
        public LineChart(IEnumerable<Row> rows, string selector) : base(rows, selector)
        {
        }

        public override string Type
        {
            get { return "line"; }
        }
    }

}