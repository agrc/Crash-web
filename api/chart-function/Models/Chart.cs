using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;

namespace chart_function.Models
{
    public class Chart
    {
        public Chart()
        {
            Categories = new List<object>();
            Series = new List<Series>();
            Selector = string.Empty;
        }

        public Chart(IEnumerable<Row> row, string selector, string type)
        {
            Selector = selector;

            Categories = row.Select(x => x.Label)
                            .OrderBy(x => x)
                            .Distinct()
                            .Select(x => x?.ToString() ?? "");

            Series = new List<Series>
            {
                new Series(row, type, "Original"),
            };
        }

        public Chart(IEnumerable<IEnumerable<Row>> rows, string selector, string type)
        {
            Selector = selector;

            var combined = rows.SelectMany(x => x);

            Categories = combined.Select(x => x.Label)
                                 .OrderBy(x => x)
                                 .Distinct();

            var original = rows.First();
            var comparison = rows.Last();

            var itemsToAddToComparison = Categories.Except(rows.Last().Select(x => x.Label));
            var itemsToAddToOriginal = Categories.Except(rows.First().Select(x => x.Label));

            if (itemsToAddToOriginal.Any())
            {
                var collection = original.ToList();
                collection.AddRange(itemsToAddToOriginal.Select(item => new Row(0, item, "")));

                original = collection;
            }

            if (itemsToAddToComparison.Any())
            {
                var collection = comparison.ToList();
                collection.AddRange(itemsToAddToComparison.Select(item => new Row(0, item, "")));

                comparison = collection;
            }

            Series = new List<Series>
            {
                new Series(original, type, "Original", new [] { "20%" }),
                new Series(comparison, type, "Comparison", new [] { "80%" }),
            };

            Categories = Categories.Select(x => x?.ToString() ?? "");
        }

        public string Selector { get; set; }

        public IEnumerable<object> Categories { get; set; }

        public List<Series> Series { get; set; }
    }

    public class Series
    {
        private readonly IEnumerable<Row> _rows;

        public Series(IEnumerable<Row> rows, string defaultType, string name, string[] center = default!)
        {
            _rows = rows;
            Type = defaultType;
            Name = name;
            Center = center;
        }

        public string Type { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string[] Center { get; set; }

        public string Name { get; set; }

        public IEnumerable<ArrayList> Data
        {
            get
            {
                var rows = _rows.Select(x => new ArrayList { x.Label, x.Occurrences }).OrderBy(x => x[0]);

                return rows.Select(x => new ArrayList { x[0]?.ToString() ?? "", x[1] });
            }
        }
    }
}
