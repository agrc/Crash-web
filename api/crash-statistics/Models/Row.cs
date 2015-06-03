namespace crash_statistics.Models {

    public class Row {
        public Row()
        {
            
        }
        
        public Row(int occurances, string label, string type)
        {
            Occurances = occurances;
            Label = label;
            Type = type;
        }

        public int Occurances { get; set; }

        public string Label { get; set; } 
        
        public string Type { get; set; }
    }

}