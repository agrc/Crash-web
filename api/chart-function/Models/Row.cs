namespace chart_function.Models
{

    public class Row
    {
        public Row()
        {

        }

        public Row(int occurrences, object label, string type)
        {
            Occurrences = occurrences;
            Label = label;
            Type = type;
        }

        public int Occurrences { get; set; }

        public object Label { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;
    }

}
