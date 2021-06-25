namespace chart_function.Models
{

    public class Result
    {
        public Chart Weather { get; set; } = new();
        public Chart Road { get; set; } = new();
        public Chart Cause { get; set; } = new();
        public Chart Distraction { get; set; } = new();
        public Chart Day { get; set; } = new();
        public Chart Time { get; set; } = new();
    }
}
