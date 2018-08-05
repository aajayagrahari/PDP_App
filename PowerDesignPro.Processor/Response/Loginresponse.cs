using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace PowerDesignPro.Response
{
    public class Loginresponse
    {
        [JsonProperty("expires_in")]
        public long ExpiresIn { get; set; }

        [JsonProperty(".issued")]
        public string Issued { get; set; }

        [JsonProperty(".expires")]
        public string Expires { get; set; }

        [JsonProperty("access_token")]
        public string AccessToken { get; set; }

        [JsonProperty("token_type")]
        public string TokenType { get; set; }

        [JsonProperty("refresh_token")]
        public string RefreshToken { get; set; }

        [JsonProperty("userName")]
        public string UserName { get; set; }

        //[JsonProperty("brand")]
        //public string Brand { get; set; }
    }
}
