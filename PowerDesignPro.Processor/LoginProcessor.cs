using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using PowerDesignPro.Interface;
using PowerDesignPro.Settings;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using PowerDesignPro.Response;
namespace PowerDesignPro.Processor
{
    public class LoginProcessor: ILogin
    {
        HttpClient client;
        private readonly AppSettings _appSettings;
        public LoginProcessor(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

        public async Task<Loginresponse> ValidateuserAsync(string username, string password)
        {
            try
            {
                client = new HttpClient();
                var request = new HttpRequestMessage(HttpMethod.Post, _appSettings.LoginURL);
                request.Content = new FormUrlEncodedContent(new Dictionary<string, string> {
                { "client_id", _appSettings.client_id },
                 { "client_secret", _appSettings.client_secret },
                      { "grant_type", _appSettings.client_credentials },
                       { "username", username },
                        { "password", password}
                });
                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();
                return JsonConvert.DeserializeObject<Loginresponse>(await response.Content.ReadAsStringAsync());
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
