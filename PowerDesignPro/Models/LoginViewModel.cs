using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
namespace PowerDesignPro.Models
{
    public class LoginViewModel
    {
        [Required(AllowEmptyStrings =false,ErrorMessage ="User Name is required")]
        [StringLength(maximumLength:225)]
        public string UserName { get; set; }
        [Required(AllowEmptyStrings = false, ErrorMessage = "Password is required")]
        [StringLength(maximumLength: 225)]
        public string Password { get; set; }

    }
}
