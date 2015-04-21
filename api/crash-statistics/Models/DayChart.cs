using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace crash_statistics.Models {

    public class DayChart : BarChart {
        private readonly IEnumerable<Row> _rows;

        public DayChart(IEnumerable<Row> rows, string selector) : base(rows, selector)
        {
            _rows = rows;
        }

        public override IEnumerable<ArrayList> Data
        {
            get
            {
                var data =
                    _rows.Select(x => new ArrayList{ int.Parse(x.Label.Trim()), x.Occurances}).OrderBy(
                        x => x[0]);

                return data.Select(GetDay);
            }
        }

        public ArrayList GetDay(ArrayList pair)
        {
            var key = (int) pair[0];

            if (key == 1)
            {
                return new ArrayList { "Sunday", pair[1] };
            }
            if (key == 2)
            {
                return new ArrayList { "Monday", pair[1] };
            }
            if (key == 3)
            {
                return new ArrayList { "Tuesday", pair[1] };
            }
            if (key == 4)
            {
                return new ArrayList { "Wednesday", pair[1] };
            }
            if (key == 5)
            {
                return new ArrayList { "Thursday", pair[1] };
            }
            if (key == 6)
            {
                return new ArrayList { "Friday", pair[1] };
            }
            if (key == 7)
            {
                return new ArrayList { "Saturday", pair[1] };
            }

            return new ArrayList { key.ToString(CultureInfo.InvariantCulture), pair[1] };
        }
    }

}