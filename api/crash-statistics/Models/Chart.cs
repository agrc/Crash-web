using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using crash_statistics.Models;
using Newtonsoft.Json;

namespace crash_statistics.Models
{
    public class Chart
    {
        public Chart()
        {
            Categories = new List<object>();
            Data = new List<Series>();
        }
        public Chart(IEnumerable<Row> row, string selector, string type)
        {
            Selector = selector;

            Func<string, object> convertToNumber = str =>
            {
                int number;

                if (int.TryParse(str, out number))
                {
                    return number;
                }

                return str;
            };

            Categories = row.Select(x => convertToNumber(x.Label.Trim())).OrderBy(x => x);

            Data = new List<Series>
            {
                new Series(row, type, "Original"),
            };
        }

        public Chart(IEnumerable<IEnumerable<Row>> rows, string selector, string type)
        {
            Selector = selector;

            Func<string, object> convertToNumber = str =>
            {
                int number;

                if (int.TryParse(str, out number))
                {
                    return number;
                }

                return str;
            };

            var combined = rows.SelectMany(x => x);

            Categories = combined.Select(x => convertToNumber(x.Label.Trim()))
                                 .OrderBy(x => x)
                                 .Distinct();

            Data = new List<Series>
            {
                new Series(rows.First(), type, "Original", new [] { "20%" }),
                new Series(rows.Last(), type, "Comparison", new [] { "80%" }),
            };
        }

        [JsonProperty(PropertyName = "selector")]
        public string Selector { get; set; }

        [JsonProperty(PropertyName = "categories")]
        public IEnumerable<object> Categories { get; set; }

        [JsonProperty(PropertyName = "series")]
        public List<Series> Data { get; set; }
    }
}

public class Series
{
    private readonly IEnumerable<Row> _rows;

    public Series(IEnumerable<Row> rows, string defaultType, string name, string[] center=null)
    {
        _rows = rows;
        Type = defaultType;
        Name = name;
        Center = center;
    }

    [JsonProperty(PropertyName = "type")]
    public string Type { get; set; }

    [JsonProperty(PropertyName = "center")]
    public string[] Center { get; set; }
    
    [JsonProperty(PropertyName = "name")]
    public string Name { get; set; }

    [JsonProperty(PropertyName = "data")]
    public IEnumerable<ArrayList> Data
    {
        get
        {
            Func<string, object> convertToNumber = str =>
            {
                int number;

                if (int.TryParse(str, out number))
                {
                    return number;
                }

                return str;
            };

            return _rows.Select(x => new ArrayList {convertToNumber(x.Label.Trim()), x.Occurances}).OrderBy(x => x[0]);
        }
    }

    public bool ShouldSerializeCenter()
    {
        return Center != null && Center.Any();
    }
}