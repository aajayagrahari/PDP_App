using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PowerDesignPro.Models;
using PowerDesignPro.Processor;
using PowerDesignPro.Settings;
using PowerDesignPro.Interface;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace PowerDesignPro.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogin _login;
        public HomeController(ILogin loginrepo)
        {
            _login = loginrepo;
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Error()
        {
            ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> OnCustomerLogin([FromBody] LoginViewModel lviewmodel)
        {
            try
            {
                var result = await _login.ValidateuserAsync(lviewmodel.UserName, lviewmodel.Password);
                return Json(result, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore ,Formatting=Formatting.Indented});
            }
            catch (InvalidOperationException ex)
            {
                return Json(ex.InnerException);
            }
            catch (Exception ex)
            {
                return Json(ex.StackTrace);
            }
        }
    }
}
