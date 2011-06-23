$(document).ready(function() {

	
	// Form validation for each field
	function formAesthetic(val1, val2){
		$(val1).focus(function(){
			console.log(now.var2)
			$(val2).css('display', 'none')
			}).blur(function(){
				var value = $(this).val()
				if (value.length === 0){
					$(val2).css('display', 'block')
				} else if (value.length > 1){
					$(val2).css('display', 'none')
				}
		})
	}
	// Photo replacement function for controlling display blocks
	function photoDisplay(val1, val2){
		$(val1).click(function() {
			$('#backgroundBlock').css('display', val2)
			$('#photoUploadBox').css('display', val2)
		})
	}
	// Email validator
	function validEmail(email) {
		var pattern = new RegExp(/^[\_]*([a-z0-9]+(\.|\_*)?)+@([a-z][a-z0-9\-]+(\.|\-*\.))+[a-z]{2,6}$/);
		return pattern.test(email);
	}

	// Change the filed focus
	function fieldChanger(val1, val2){
		$(val1).keyup(function(){
			var value = $(this).val()
			if (validEmail(value)){
				$(val2).focus()
				now.user(value, function(data){ console.log(data) })
			} else {}
		})
	}
	
	// Profile validator and picture fetcher
	function profileValidate(val1){
		var value = $(val1).val()
		function profilePic(picture){
			$('#profilePic').replaceWith('<img id="profilePic" src="/profiles/'+picture+'"/>')
		}
		function name(firstName, lastName){
			$('#profileName').replaceWith('<span id="profileName">'+firstName+' '+lastName+'</span>')
		}
		if (value.length < 3){
			$(val1).blur(function(){
				var newVal1 = $(this).val()
				if (validEmail(newVal1)){
					now.user(newVal1, function(data){
						if (data){
							profilePic(data.picture)
							name(data.firstName, data.lastName)
						} else {
							$('#profilePic').replaceWith('<span id="profilePic">E-Mail not valid.</span>')
						}
					})
				} else {
					$('#profilePic').replaceWith('<div id="profilePic"></div>')
					$('#profileName').replaceWith('<div id="profileName"></div>')
				}
			})
		} else if (value.length > 2 && validEmail(value)){
			now.user(value, function(data){ 
				if (data){
					profilePic(data.picture)
					name(data.firstName, data.lastName)
				}
			})
		} else if (value.length === 0){
			$('#profilePic').replaceWith('<span id="profilePic"></span>')
		}
	}

	/**
	 *     Make the form fields look good when selected
	 */
//	formAesthetic('#email', '#labelEmail')
//	formAesthetic('#password', '#labelPass')
	
	/**
	 *     Photo Display
	 */
	photoDisplay('#closeUploadBox', 'none')
	photoDisplay('#addressConfigure', 'none')
	photoDisplay('#editBox', 'block')
	
	/**
	 *     Field Change function
	 */
//	fieldChanger('#email', '#password')
	

	/**
	 *		Nowjs
	 */
	now.ready(function(){
		profileValidate('#email')
	})
	
})

