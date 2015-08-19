using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using crash_statistics.Models;
using NUnit.Framework;

namespace crash_statistics.tests
{
    [TestFixture]
    public class ChartTests
    {
        [Test]
        public void ChartDataAddsMissingValuesForMultipleSeries()
        {
            var original = new List<Row>
            {
                new Row(1, "a1", "weather"),
                new Row(2, "b1", "weather"),
                new Row(3, "c1", "weather"),
                new Row(11, "a2", "weather")
            };

            var comparison = new List<Row>
            {
                new Row(11, "a2", "weather"),
                new Row(12, "b2", "weather"),
                new Row(2, "b1", "weather")
            };

            var chart = new Chart(new[] {original, comparison}, "node", "pie");

            Assert.That(chart.Categories, Is.EquivalentTo(new[] {"a1", "a2", "b1", "b2", "c1"}),
                "categorie is incorrect");
            Assert.That(chart.Categories, Is.EquivalentTo(chart.Data[0].Data.Select(x => x[0])),
                "original series is incorrect");
            Assert.That(chart.Categories, Is.EquivalentTo(chart.Data[1].Data.Select(x => x[0])),
                "comparison series is incorrect");
        }

        [Test]
        public void ChartDataIsFormattedProperlyForComparisonsAndDispareteGroups()
        {
            var original = new List<Row>
            {
                new Row(1, "a", "weather"),
                new Row(3, "c", "weather"),
                new Row(4, "d", "weather"),
                new Row(5, "e", "weather"),
                new Row(6, "z", "road"),
                new Row(7, "x", "road"),
                new Row(8, "y", "road"),
                new Row(9, "w", "road"),
                new Row(10, "f", "road")
            };

            var comparison = new List<Row>
            {
                new Row(10, "a", "weather"),
                new Row(9, "b", "weather"),
                new Row(8, "c", "weather"),
                new Row(7, "d", "weather"),
                new Row(11, "e", "weather"),
                new Row(12, "z", "road"),
                new Row(13, "x", "road"),
                new Row(14, "y", "road"),
                new Row(16, "f", "road")
            };

            var chart = new Chart(new[] {original, comparison}, "node", "pie");

            Assert.That(chart.Categories, Is.EquivalentTo(new[] {"a", "b", "c", "d", "e", "f", "w", "x", "y", "z"}));

            Assert.That(chart.Data.First().Type, Is.EqualTo("pie"));
            Assert.That(chart.Data.First().Name, Is.EqualTo("Original"));
            Assert.That(chart.Data.First().Center, Is.EquivalentTo(new[] {"20%"}));
            Assert.That(chart.Data.First().Data, Is.EquivalentTo(new[]
            {
                new ArrayList {"a", 1},
                new ArrayList {"b", 0},
                new ArrayList {"c", 3},
                new ArrayList {"d", 4},
                new ArrayList {"e", 5},
                new ArrayList {"f", 10},
                new ArrayList {"w", 9},
                new ArrayList {"x", 7},
                new ArrayList {"y", 8},
                new ArrayList {"z", 6}
            }));

            Assert.That(chart.Data.Last().Name, Is.EqualTo("Comparison"));
            Assert.That(chart.Data.Last().Center, Is.EquivalentTo(new[] {"80%"}));
            Assert.That(chart.Data.Last().Data, Is.EquivalentTo(new[]
            {
                new ArrayList {"a", 10},
                new ArrayList {"b", 9},
                new ArrayList {"c", 8},
                new ArrayList {"d", 7},
                new ArrayList {"e", 11},
                new ArrayList {"f", 16},
                new ArrayList {"w", 0},
                new ArrayList {"x", 13},
                new ArrayList {"y", 14},
                new ArrayList {"z", 12}
            }));
        }

        [Test]
        public void ChartDataIsFormattedProperlyForComparisonsAndMultipleGroups()
        {
            var original = new List<Row>
            {
                new Row(1, "a", "weather"),
                new Row(2, "b", "weather"),
                new Row(3, "c", "weather"),
                new Row(4, "d", "weather"),
                new Row(5, "e", "weather"),
                new Row(6, "z", "road"),
                new Row(7, "x", "road"),
                new Row(8, "y", "road"),
                new Row(9, "w", "road"),
                new Row(10, "f", "road")
            };

            var comparison = new List<Row>
            {
                new Row(10, "a", "weather"),
                new Row(9, "b", "weather"),
                new Row(8, "c", "weather"),
                new Row(7, "d", "weather"),
                new Row(11, "e", "weather"),
                new Row(12, "z", "road"),
                new Row(13, "x", "road"),
                new Row(14, "y", "road"),
                new Row(15, "w", "road"),
                new Row(16, "f", "road")
            };

            var chart = new Chart(new[] {original, comparison}, "node", "pie");

            Assert.That(chart.Categories, Is.EquivalentTo(new[] {"a", "b", "c", "d", "e", "f", "w", "x", "y", "z"}));

            Assert.That(chart.Data.First().Type, Is.EqualTo("pie"));
            Assert.That(chart.Data.First().Name, Is.EqualTo("Original"));
            Assert.That(chart.Data.First().Center, Is.EquivalentTo(new[] {"20%"}));
            Assert.That(chart.Data.First().Data, Is.EquivalentTo(new[]
            {
                new ArrayList {"a", 1},
                new ArrayList {"b", 2},
                new ArrayList {"c", 3},
                new ArrayList {"d", 4},
                new ArrayList {"e", 5},
                new ArrayList {"f", 10},
                new ArrayList {"w", 9},
                new ArrayList {"x", 7},
                new ArrayList {"y", 8},
                new ArrayList {"z", 6}
            }));

            Assert.That(chart.Data.Last().Name, Is.EqualTo("Comparison"));
            Assert.That(chart.Data.Last().Center, Is.EquivalentTo(new[] {"80%"}));
            Assert.That(chart.Data.Last().Data, Is.EquivalentTo(new[]
            {
                new ArrayList {"a", 10},
                new ArrayList {"b", 9},
                new ArrayList {"c", 8},
                new ArrayList {"d", 7},
                new ArrayList {"e", 11},
                new ArrayList {"f", 16},
                new ArrayList {"w", 15},
                new ArrayList {"x", 13},
                new ArrayList {"y", 14},
                new ArrayList {"z", 12}
            }));
        }

        [Test]
        public void ChartDataIsFormattedProperlyForComparisonsAndOneGroup()
        {
            var original = new List<Row>
            {
                new Row(1, "a", "weather"),
                new Row(2, "b", "weather"),
                new Row(3, "c", "weather"),
                new Row(4, "d", "weather"),
                new Row(5, "e", "weather")
            };

            var comparison = new List<Row>
            {
                new Row(10, "a", "weather"),
                new Row(9, "b", "weather"),
                new Row(8, "c", "weather"),
                new Row(7, "d", "weather"),
                new Row(6, "e", "weather")
            };

            var chart = new Chart(new[] {original, comparison}, "node", "pie");

            Assert.That(chart.Categories, Is.EquivalentTo(new[] {"a", "b", "c", "d", "e"}));

            Assert.That(chart.Data.First().Type, Is.EqualTo("pie"));
            Assert.That(chart.Data.First().Name, Is.EqualTo("Original"));
            Assert.That(chart.Data.First().Center, Is.EquivalentTo(new[] {"20%"}));
            Assert.That(chart.Data.First().Data, Is.EquivalentTo(new[]
            {
                new ArrayList {"a", 1},
                new ArrayList {"b", 2},
                new ArrayList {"c", 3},
                new ArrayList {"d", 4},
                new ArrayList {"e", 5}
            }));

            Assert.That(chart.Data.Last().Name, Is.EqualTo("Comparison"));
            Assert.That(chart.Data.Last().Center, Is.EquivalentTo(new[] {"80%"}));
            Assert.That(chart.Data.Last().Data, Is.EquivalentTo(new[]
            {
                new ArrayList {"a", 10},
                new ArrayList {"b", 9},
                new ArrayList {"c", 8},
                new ArrayList {"d", 7},
                new ArrayList {"e", 6}
            }));
        }

        [Test]
        public void ChartDataIsFormattedProperlyForMultipleGroups()
        {
            var rows = new List<Row>
            {
                new Row(1, "a", "weather"),
                new Row(2, "b", "weather"),
                new Row(3, "c", "weather"),
                new Row(4, "d", "weather"),
                new Row(5, "e", "weather"),
                new Row(6, "z", "road"),
                new Row(7, "x", "road"),
                new Row(8, "y", "road"),
                new Row(9, "w", "road"),
                new Row(10, "f", "road")
            };

            var chart = new Chart(rows, "node", "pie");

            Assert.That(chart.Categories, Is.EquivalentTo(new[] {"a", "b", "c", "d", "e", "f", "w", "x", "y", "z"}));
            Assert.That(chart.Data.First().Type, Is.EqualTo("pie"));
            Assert.That(chart.Data.First().Name, Is.EqualTo("Original"));
            Assert.That(chart.Data.First().Data, Is.EquivalentTo(new[]
            {
                new ArrayList {"a", 1},
                new ArrayList {"b", 2},
                new ArrayList {"c", 3},
                new ArrayList {"d", 4},
                new ArrayList {"e", 5},
                new ArrayList {"f", 10},
                new ArrayList {"w", 9},
                new ArrayList {"x", 7},
                new ArrayList {"y", 8},
                new ArrayList {"z", 6}
            }));
        }

        [Test]
        public void ChartDataIsFormattedProperlyForOneGroup()
        {
            var rows = new List<Row>
            {
                new Row(1, "a", "weather"),
                new Row(2, "b", "weather"),
                new Row(3, "c", "weather"),
                new Row(4, "d", "weather"),
                new Row(5, "e", "weather")
            };

            var chart = new Chart(rows, "node", "pie");

            Assert.That(chart.Categories, Is.EquivalentTo(new[] {"a", "b", "c", "d", "e"}));
            Assert.That(chart.Data.First().Type, Is.EqualTo("pie"));
            Assert.That(chart.Data.First().Name, Is.EqualTo("Original"));
            Assert.That(chart.Data.First().Data, Is.EquivalentTo(new[]
            {
                new ArrayList {"a", 1},
                new ArrayList {"b", 2},
                new ArrayList {"c", 3},
                new ArrayList {"d", 4},
                new ArrayList {"e", 5}
            }));
        }

        [Test]
        public void ChartDataIsInSameOrderAsCategories()
        {
            var original = new List<Row>
            {
                new Row(1, "a", "weather"),
                new Row(3, "b", "weather"),
                new Row(4, "c", "weather"),
                new Row(5, "d", "weather"),
                new Row(6, "z", "road"),
                new Row(7, "x", "road"),
                new Row(8, "y", "road")
            };

            var chart = new Chart(original, "node", "pie");
            Assert.That(chart.Categories, Is.EquivalentTo(chart.Data[0].Data.Select(x => x[0])));
        }

        [Test]
        public void DatesAreOrderedSundayToSaturday()
        {
            var rows = new List<Row>
            {
                new Row(2, DayOfWeek.Tuesday, "day"),
                new Row(0, DayOfWeek.Sunday, "day"),
                new Row(3, DayOfWeek.Wednesday, "day"),
                new Row(6, DayOfWeek.Saturday, "day"),
                new Row(5, DayOfWeek.Friday, "day"),
                new Row(1, DayOfWeek.Monday, "day")
            };

            var chart = new Chart(rows, "node", "pie");

            Assert.That(chart.Categories,
                Is.EquivalentTo(new[] {"Sunday", "Monday", "Tuesday", "Wednesday", "Friday", "Saturday"}));
            Assert.That(chart.Data.First().Type, Is.EqualTo("pie"));
            Assert.That(chart.Data.First().Name, Is.EqualTo("Original"));
            Assert.That(chart.Data.First().Data.First(), Is.EquivalentTo(new ArrayList {"Sunday", 0}));
            Assert.That(chart.Data.First().Data.Last(), Is.EquivalentTo(new ArrayList {"Saturday", 6}));
        }
        
        [Test]
        public void DatesAreOrderedSundayToSaturdayInComparison()
        {
            var rows = new List<Row>
            {
                new Row(1, DayOfWeek.Tuesday, "day"),
                new Row(1, DayOfWeek.Wednesday, "day"),
                new Row(1, DayOfWeek.Saturday, "day"),
                new Row(1, DayOfWeek.Friday, "day"),
                new Row(1, DayOfWeek.Monday, "day")
            };

            var comparison = new List<Row>
            {
                new Row(1, DayOfWeek.Sunday, "day"),
                new Row(1, DayOfWeek.Wednesday, "day"),
                new Row(1, DayOfWeek.Thursday, "day"),
                new Row(1, DayOfWeek.Friday, "day"),
                new Row(1, DayOfWeek.Monday, "day")
            };

            var chart = new Chart(new[] {rows, comparison}, "node", "pie");

            Assert.That(chart.Categories,
                Is.EquivalentTo(new[] {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"}));
            Assert.That(chart.Data.First().Type, Is.EqualTo("pie"));
            Assert.That(chart.Data.First().Name, Is.EqualTo("Original"));
            Assert.That(chart.Data.First().Data.First(), Is.EquivalentTo(new ArrayList {"Sunday", 0}));
            Assert.That(chart.Data.First().Data.Last(), Is.EquivalentTo(new ArrayList {"Saturday", 1}));
            Assert.That(chart.Data.Last().Data.First(), Is.EquivalentTo(new ArrayList {"Sunday", 1}));
            Assert.That(chart.Data.Last().Data.Last(), Is.EquivalentTo(new ArrayList {"Saturday", 0}));
        }

    }
}