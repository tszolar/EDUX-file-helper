// ==UserScript==
// @name       Edux File Helper
// @namespace  http://use.i.E.your.homepage/
// @version    0.2
// @description  enter something useful
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @match      https://edux.fit.cvut.cz/courses/*
// @copyright  2014+, flex
// ==/UserScript==
this.$ = this.jQuery = jQuery.noConflict(true);

$(function(){
	var fetch_namespace_tree = function(course_code, tree_fetch_success) {
		var namespace = '';
		var success = function( data ) {
			//$(".result").html( data );
			// alert( "Load was performed." );
			//console.log(data);
			
			var doc = document.implementation.createHTMLDocument();
			// doc.open();
			//Replace scripts
			data = data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
			//Write HTML to the new document
			// doc.write(data);
			doc.documentElement.innerHTML = data;
			// doc.close();
			
			// console.log(doc.body);  //Empty
			var file_nodes = doc.querySelectorAll('#media__content div.odd, #media__content div.even');
			$(file_nodes).find("")

			// var file_nodes = doc.$('#media__content div.odd, #media__content div.even');
			console.log(file_nodes);

			var tree = "";
			tree_fetch_success(tree);
		};

		var url = 'https://edux.fit.cvut.cz/courses/'+ course_code + '/lib/exe/mediamanager.php?ns='+namespace;
		$.get(url, success);
	};

	var course_code = "MI-PIS";
	var namespace = "lectures";
	
	fetch_namespace_tree(course_code, function(tree){
		console.log(tree)
	});

	
});

