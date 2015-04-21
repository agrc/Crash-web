using Newtonsoft.Json;

namespace crash_statistics.Models {

    public class Result {
        [JsonProperty(PropertyName = "weather")]
        public Chart Weather { get; set; }
        
        [JsonProperty(PropertyName = "road")]
        public Chart Road { get; set; }
        
        [JsonProperty(PropertyName = "cause")]
        public Chart Cause { get; set; }
        
        [JsonProperty(PropertyName = "distraction")]
        public Chart Distractions { get; set; }
        
        [JsonProperty(PropertyName = "day")]
        public Chart Days { get; set; }
        
        [JsonProperty(PropertyName = "time")]
        public Chart Time { get; set; } 
    }

}