using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace crash_statistics.Models {

    public class TimeChart : LineChart {
        private readonly IEnumerable<Row> _rows;

        public TimeChart(IEnumerable<Row> rows, string selector) : base(rows, selector)
        {
            _rows = rows;
        }

        public override IEnumerable<ArrayList> Data
        {
            get
            {
                var data =
                    _rows.Select(x => new ArrayList{int.Parse(x.Label.Trim()), x.Occurances}).OrderBy(
                        x => x[0]);

                return data;
            }
        }
    }

}