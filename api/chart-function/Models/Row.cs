namespace crash_statistics.Models
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

        public object Label { get; set; }

        public string Type { get; set; }
    }

}
