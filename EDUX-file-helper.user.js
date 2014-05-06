// ==UserScript==
// @name       EDUX file helper
// @namespace  http://use.i.E.your.homepage/
// @version    0.2
// @description  enter something useful
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require     http://stuk.github.io/jszip/dist/jszip.js
// @require     http://stuk.github.io/jszip-utils/dist/jszip-utils.js
// @require     https://raw.githubusercontent.com/eligrey/FileSaver.js/master/FileSaver.js
// @match      https://edux.fit.cvut.cz/courses/*
// @copyright  2014+, flex
// ==/UserScript==

'use strict';

this.$ = this.jQuery = jQuery.noConflict(true);

$(function(){
	//var namespaces_to_search = ["", "lectures", "labs"];

	var course_files = [];

	var download_all_zip = function(course, files) {
		var zip = new JSZip();

		var requests = files.map(function(file) {
			return $.ajax(file, {
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

		$.when.apply(null, requests).done(function() {
			var content = zip.generate({type:"blob"});
			// see FileSaver.js
			saveAs(content, "example.zip");
		});
	});
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
			console.log(link.href);
			course_files.push(link.href);
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
	
	fetch_ns_info("MI-PIS", "", 0);

	var files = ["https://edux.fit.cvut.cz/courses/MI-SPI/_media/lectures/mi-spi-lec01-probabilityreview.pdf", "https://edux.fit.cvut.cz/courses/MI-SPI/_media/lectures/mi-spi-lec03-randomvariables.pdf"];

});

