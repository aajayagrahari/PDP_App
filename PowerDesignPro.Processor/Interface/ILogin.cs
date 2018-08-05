using Newtonsoft.Json.Linq;
using PowerDesignPro.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace PowerDesignPro.Interface
{
    public interface ILogin
    {
        Task<Loginresponse> ValidateuserAsync(string username, string password);
    }
}
