using Nancy;

namespace crash_statistics
{
    public class HomeModule : NancyModule
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="HomeModule" /> class.
        /// </summary>
        public HomeModule()
        {
            Get["/"] = _ => View["Home"];
        }
    }
}