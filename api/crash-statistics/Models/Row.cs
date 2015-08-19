namespace crash_statistics.Models {

    public class Row {
        public Row()
        {
            
        }
        
        public Row(int occurances, object label, string type)
        {
            Occurances = occurances;
            Label = label;
            Type = type;
        }

        public int Occurances { get; set; }

        public object Label { get; set; } 
        
        public string Type { get; set; }
    }

}