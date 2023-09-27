function validateForm( validationGroup )
{
    if (typeof tinyMCE !== 'undefined') {
        //http://aspsnippets.com/Articles/Performing-Validation-in-TinyMCE-Editor-using-ASP.Net-Validation-Controls.aspx
        tinyMCE.triggerSave(false, true);
    } 
    
	if (typeof(Page_Validators) == "undefined")  return;

	var errorControls = [];
	var errorControlIndex = 0;
	var isError = false;

	for (var i = 0; i < Page_Validators.length; i++)
	{

		ValidatorValidate(Page_Validators[i], validationGroup);
		var control = document.getElementById(Page_Validators[i].controltovalidate);
		var group = $(control).parents('.form-group');

		console.log(group.id);

		if (HasError(errorControls, Page_Validators[i].controltovalidate))
		{
		    //isError = true;
		}
		else if (document.getElementById(Page_Validators[i].id).isvalid)
		{
		    group.removeClass("has-error");
		    group.find('.fa-asterisk').show();
		}
		else
		{
			errorControls[errorControlIndex] = Page_Validators[i].controltovalidate;
			errorControlIndex++;

			group.addClass("has-error");
			group.find('.fa-asterisk').hide();
			isError = true;
		}
    }

    return isError;

}

function setfocus(objectid) {
    if (document.getElementById(objectid)) {
        document.getElementById(objectid).focus();
    }
}

function onChangeValidation( element )
{
	if (typeof(Page_Validators) == "undefined")  return;
    
	var errorControls = [];
	var errorControlIndex = 0;

	for (var i = 0; i < Page_Validators.length; i++)
	{
		if (Page_Validators[i].controltovalidate == element.id)
		{
		    ValidatorValidate(Page_Validators[i]);

		    var control = document.getElementById(Page_Validators[i].controltovalidate);
		    var group = $(control).parents('.form-group');

		    console.log(Page_Validators[i].controltovalidate);

            if (HasError(errorControls, Page_Validators[i].controltovalidate))
            {
			}
			else if (document.getElementById(Page_Validators[i].id).isvalid)
			{
			    group.removeClass("has-error");
			    group.find('.fa-asterisk').show();
			}
			else
			{
				errorControls[errorControlIndex] = Page_Validators[i].controltovalidate;
				errorControlIndex++;

				group.addClass("has-error");
				group.find('.fa-asterisk').hide();
			}
		}
	}
}

function HasError(errorControls, controlId)
{
	for (var i = 0; i < errorControls.length; i++)
	{	    
		if (errorControls[i] == controlId)
		{
			return true;
		}
	}
	
	return false;
}