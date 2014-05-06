// ==UserScript==
// @name       EDUX file helper
// @namespace  http://use.i.E.your.homepage/
// @version    0.2
// @description  enter something useful
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js	
// @require     http://stuk.github.io/jszip/dist/jszip.js
// @require     http://stuk.github.io/jszip-utils/dist/jszip-utils.js
// @require     https://raw.githubusercontent.com/eligrey/FileSaver.js/master/FileSaver.js
// @resource    http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css
// @match      https://edux.fit.cvut.cz/courses/*
// @copyright  2014+, flex
// ==/UserScript==

'use strict';

var newCSS 	= GM_getResourceText ("jqueryui_css");
GM_addStyle(newCSS);

this.$ = this.jQuery = jQuery.noConflict(true);

$(function(){
	document.body.appendChild(document.createElement('div')).id = "download-dialog";
	$( ".funding" ).before("<h2>File exports</h2><ul><li><a href='#' id='file_export_all' class='wikilink1'>Download all files</a></ul>");


	// $( "#download-dialog" ).dialog({
	// 	autoOpen: false,
	// 	height: 300,
	// 	width: 350,
	// 	modal: true,
	// 	buttons: {
	// 		"Create an account": function() {
	// 			var bValid = true;
	// 			allFields.removeClass( "ui-state-error" );
	// 			bValid = bValid && checkLength( name, "username", 3, 16 );
	// 			bValid = bValid && checkLength( email, "email", 6, 80 );
	// 			bValid = bValid && checkLength( password, "password", 5, 16 );
	// 			bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter." );
	// 			// From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
	// 			bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. ui@jquery.com" );
	// 			bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
	// 			if ( bValid ) {
	// 				$( "#users tbody" ).append( "<tr>" +
	// 				"<td>" + name.val() + "</td>" +
	// 				"<td>" + email.val() + "</td>" +
	// 				"<td>" + password.val() + "</td>" +
	// 				"</tr>" );
	// 				$( this ).dialog( "close" );
	// 			}
	// 		},
	// 		Cancel: function() {
	// 			$( this ).dialog( "close" );
	// 		}
	// 	},
	// 	close: function() {
	// 		allFields.val( "" ).removeClass( "ui-state-error" );
	// 	}
	// });

	var course_files = [];

	var download_files = function(files_to_download, zip) {
		if(files_to_download.length <= 0) {
			var content = zip.generate({type:"blob"});
			// see FileSaver.js
			saveAs(content, "example.zip");
			return;
		}
		var page_size = 5;

		var files = files_to_download.slice(0, page_size);
		var rest = files_to_download.slice(page_size);

		var requests = files.map(function(file) {
			var url = "https://edux.fit.cvut.cz" + file;
			return $.ajax(url, {
				dataType: "text",
				beforeSend: function( xhr, settings ) {
					xhr.overrideMimeType( "text/plain; charset=x-user-defined");
					xhr.url = settings.url;
				},
				success: function(data, status, xhr) {
					var url = xhr.url;
					var url_parts = url.split("/");
					var file_name = url_parts[url_parts.length - 1];
					//zip.file("Hello.txt", "Hello World\n");
					zip.file(file_name, data, {binary: true});
				}
			});				
		});

		$.when.apply(null, requests).done(function() {
			download_files(rest, zip);
		});
	};

	var download_all_zip = function(files_to_download) {
		var zip = new JSZip();
		download_files(files_to_download, zip);	
	};


	var get_child_namespaces = function(doc, parent_namespace, current_depth) {
		var child_depth = current_depth + 1;
		var ns_nodes = doc.querySelectorAll(".media.level" + child_depth + ".closed");
		return [].map.call(ns_nodes, function(node) {
			var link = node.querySelector("a.idx_dir");
			var prefix = parent_namespace;
			if(prefix != "")
				prefix += "/";
			return prefix + link.text;
		});
	};

	var process_files = function(file_nodes, namespace) {
		console.log("Files for "+namespace+":");
		console.log(file_nodes);
		//file_nodes.querySelector("");

		[].forEach.call(file_nodes, function(file_node) {
			var link = file_node.querySelector("a:nth-child(3)");
			var href = link.getAttribute('href');
			console.log(href);
			course_files.push(href);
		});
	};

	var generate_doc = function(data) {
		var doc = document.implementation.createHTMLDocument();
		//Replace scripts
		data = data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
		doc.documentElement.innerHTML = data;
		return doc;
	}

	var fetch_ns_info = function(course_code, namespace, depth) {
		if(namespace == "av" || namespace == "student") return;
		var success = function( data ) {
			
			var doc = generate_doc(data);
			var file_nodes = doc.querySelectorAll('#media__content div.odd, #media__content div.even');
			process_files(file_nodes, namespace);

			var child_namespaces = get_child_namespaces(doc, namespace, depth);
			child_namespaces.forEach(function(ns) {
				//console.log(ns);
				fetch_ns_info(course_code, ns, depth + 1);
			});

		};

		var url = 'https://edux.fit.cvut.cz/courses/'+ course_code + '/lib/exe/mediamanager.php?ns='+namespace;
		$.get(url, success);
	};

	var course_code = "MI-PIS";
	var namespace = "lectures";
	
	fetch_ns_info("MI-FLP", "", 0);

	$( "#file_export_all").click(function(event){
		event.preventDefault();
		download_all_zip(course_files);
	});

	var files = ["https://edux.fit.cvut.cz/courses/MI-SPI/_media/lectures/mi-spi-lec01-probabilityreview.pdf", "https://edux.fit.cvut.cz/courses/MI-SPI/_media/lectures/mi-spi-lec03-randomvariables.pdf"];

});

