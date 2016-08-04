/*
 * App engine
 * html5calc - Released under GNU GPL v3
 */

 	var elements = [ ];
	var clickQueue = [ ];
	
	var addedElementsCounter = 0;

	var coord_x = 0;
	var coord_y = 0;
	
	var first_point_x = 0;
	var first_point_y = 0;
	
	var scale_size_px = 0;
	var scale_size_unit = 0;
	var scale_unit = "cm";
	
	var ctx;
	var canvas;
	
    $(document).ready(function() {
	  canvas = document.getElementById("imageCanvas");
	  ctx = canvas.getContext("2d");
	  $('#modal-bg').hide(); 
	  $('#about_app').hide();
	  
	  Mousetrap.bind("a", function() {
		addElement();
	  });
	  Mousetrap.bind("m", function() {
		quickMeasure();
	  });
	  Mousetrap.bind("s", function() {
		if(clickQueue.length == 0 && confirm("Impostare scala?")) {
			setScale();
		}
	  });
	  Mousetrap.stopCallback = function () {
		return false;
	  }
	  
	  
	  if(Cookies.get("scale_size_px") && Cookies.get("scale_size_unit") && Cookies.get("scale_unit")) {
		scale_size_px = Cookies.get("scale_size_px");
		scale_size_unit = Cookies.get("scale_size_unit");
		scale_unit = Cookies.get("scale_unit");
		
		document.getElementById("scale_1").value = "salvato";
		document.getElementById("scale_2").value = "salvato";
		document.getElementById("scale_distance").value = scale_size_unit;
		document.getElementById("scale_unit").value = scale_unit;
		document.getElementById("scale_prop").innerHTML = scale_size_px + " px = " + scale_size_unit + " " + scale_unit;
	  }
	  
      var $panzoom = $('#imageCanvas').panzoom({
		minScale: 1,
		$zoomRange: $("#zoom"),
		contain: 'invert'
	  });
	  
	  // check support
	  if (window.File && 
		  window.FileReader &&
 		  window.FileList &&
		  window.Blob) {
		// APIs supported!
	  } else {
		alert('Il browser non è supportato.');
	  }
	  try {
		var isFileSaverSupported = !!new Blob;
	  } catch (e) {
	    alert("Download locale .csv non supportato, utilizzare un browser più recente");
	  }
	  
      setTimeout(function() { 
		$("#loading").fadeOut(500); 
	  }, 500);
	  
	  
	  function getCanvasCoords(x,y){
		var matrix = $panzoom.panzoom("getMatrix");
		var calc_x = Math.round(x * (1 / matrix[0]));
		var calc_y = Math.round(y * (1 / matrix[3]));
		return {x:calc_x,y:calc_y};   
	  }
	  $("#imageCanvas").mousemove(function(e) {
		var rect = canvas.getBoundingClientRect();
		var coords = getCanvasCoords(e.clientX - rect.left, e.clientY - rect.top);
		document.getElementById("coordinates_display").innerHTML = "x: " + coords['x'] + ";<br>y: " + coords['y'] + ";";
	  });
	  $("#imageCanvas").mouseout(function(e) {
	    document.getElementById("coordinates_display").innerHTML = "x: 0;<br>y: 0;";
      });
	  $("#imageCanvas").mouseup(function(e) {
		
		var rect = canvas.getBoundingClientRect();
		var coords = getCanvasCoords(e.clientX - rect.left, e.clientY - rect.top);
		
	    coord_x = coords['x'];
	    coord_y = coords['y'];
		
		(clickQueue.shift())();
	  });
	  
    });
	function onFileSelected(event) {
	  
	  var file = event.target.files[0];
	  var fr = new FileReader();
	  fr.readAsDataURL(file);
	  var img = new Image();
	  img.src = fr.result;
	  img.onload = function() {
	    canvas.width = img.width;
		canvas.height = img.height;
		
		ctx.drawImage(img, 0, 0);
        ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
        ctx.fillRect(0, 0, 500, 500);
	  };
	  
	 
	}
	
	
    function onFileSelected(event) {
      if(elements.length != 0) {
        elements = [ ];
        refreshElementList();
      }
      var input, file, fr, img;
      file = event.target.files[0];
      fr = new FileReader();
      fr.onload = createImage;
      fr.readAsDataURL(file);

      function createImage() {
          img = new Image();
          img.onload = imageLoaded;
          img.src = fr.result;
      }
      function imageLoaded() {
        var canvas = document.getElementById("imageCanvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0);
		$("#imagePicker").blur();
      }
    }

	function setCrosshairCursor() {
		document.getElementById("imageCanvas").style.cursor = "crosshair";
	}
	function resetCursor() {
		document.getElementById("imageCanvas").style.cursor = "move";
	}
	function setHighlighted(id) {
		document.getElementById(id).style.backgroundColor = "#00EE00";
	}
	function resetHighlighted(id) {
		document.getElementById(id).style.removeProperty("background-color");
	}
	
	function setScale() {
	  if(clickQueue.length == 0) {
		if(confirm("Assicurarsi che lo zoom sia regolato correttamente prima di acquisire le misure. Toccare il punto d'inizio e il punto di fine della retta. Premere OK per continuare.")) {
			setCrosshairCursor();
			setHighlighted("scale_1");
		
			var setFirstPoint = function() {
				resetHighlighted("scale_1");
				document.getElementById("scale_1").value = coord_x + "," + coord_y;
				setHighlighted("scale_2");
				ctx.fillStyle = "#0000FF";
			    ctx.fillRect(coord_x - 2, coord_y - 2,4,4);
				first_point_x = coord_x;
				first_point_y = coord_y;
			};
			var setSecondPoint = function() {
				ctx.fillStyle = "#0000FF";
				ctx.fillRect(coord_x - 2, coord_y - 2,4,4);
				ctx.beginPath();
				ctx.moveTo(first_point_x, first_point_y);
				ctx.lineTo(coord_x,coord_y);
				ctx.lineWidth = 2;
				ctx.strokeStyle = "#0000FF";
				ctx.stroke();
				
				resetHighlighted("scale_2");
				document.getElementById("scale_2").value = coord_x + "," + coord_y;
				
				var distanceWithUnit = ["nan", ""];
				while(isNaN(distanceWithUnit[0]) || distanceWithUnit[0] == 0 || distanceWithUnit[1] == "" || distanceWithUnit[1] == null) {
					if(distanceWithUnit[0] !== "nan") alert("Numero non valido. La misura e l'unità devono essere separate da uno spazio.");
					distanceWithUnit = prompt("Inserire la distanza corrispondente alla selezione, seguita da uno spazio e dall'unità di misura").split(" "); 
				}
				
				document.getElementById("scale_distance").value = distanceWithUnit[0];
				document.getElementById("scale_unit").value = distanceWithUnit[1];
				var dist_x = Math.abs($("#scale_1").val().split(",")[0] - $("#scale_2").val().split(",")[0]);
				var dist_y = Math.abs($("#scale_1").val().split(",")[1] - $("#scale_2").val().split(",")[1]);
				
				scale_size_px = Math.round(Math.sqrt(Math.pow(dist_x, 2) + Math.pow(dist_y, 2)));
				scale_size_unit = distanceWithUnit[0];
				scale_unit = distanceWithUnit[1];
				
				document.getElementById("scale_prop").innerHTML = scale_size_px + " pixel = " + scale_size_unit + " " + scale_unit;
				resetCursor();
				ctx.font = "10px Arial";
				ctx.fillText(distanceWithUnit[0] + " " + distanceWithUnit[1], first_point_x, first_point_y - 10);
			};
			clickQueue.push(setFirstPoint);
			clickQueue.push(setSecondPoint);
		}
		} else {
     	  alert("Prima di effettuare la misurazione è necessario terminare le altre operazioni.");
		}
		}
		function refreshElementList() {
			document.getElementById("elements").innerHTML = "";
			for(var i = 0; i < elements.length; i++) {
				var opt = document.createElement("option");
				opt.innerHTML =  elements[i][0];
				opt.value = i + "|" + elements[i][1];
				document.getElementById("elements").appendChild(opt);
			}
		}
		function deleteSelectedValue() {
			if($("#elements").val() && confirm("Sei sicuro di voler cancellare \"" + $("#elements option:selected").text() + "\"?")) {
				var index = $("#elements").val().split("|")[0];
				var coords = ($("#elements").val().split("|")[1]).split(",");
				if (index > -1) {
				  elements.splice(index, 1);
				}
				ctx.fillStyle = "#FFFFFF";
				ctx.fillRect(coords[0] - 1, coords[1] - 1, 2,2);
				refreshElementList();
			}
		}
		function addElement() {
		  if(clickQueue.length == 0) {
			setCrosshairCursor();
			document.getElementById("addButton").innerHTML = "Selezionare un punto";
			setHighlighted("addButton");
			clickQueue.push(function() {
				var name = prompt("Specificare un nome per l'elemento (lasciare vuoto per \"E" + (addedElementsCounter + 1) + "\")");
				if(name !== null) {
					if(name == "") {
						name = "E" + (addedElementsCounter + 1);
					}
					elements.push([name, coord_x + "," + coord_y]);
					ctx.fillStyle = "#FF0000";
					ctx.fillRect(coord_x - 1, coord_y - 1, 2, 2);
					addedElementsCounter++;
				}
				
				resetHighlighted("addButton");
				resetCursor();
			
				refreshElementList();
				document.getElementById("addButton").innerHTML = "Aggiungi elemento";
			});
		  } else {
			alert("Prima di effettuare la misurazione è necessario terminare le altre operazioni.");
		  }
		}
		function computeDistance(x1, y1, x2, y2) {
			return Math.sqrt(Math.pow(Math.abs(x2-x1),2) + Math.pow(Math.abs(y2-y1),2)).toFixed(3);
		}
		function pixelToUnit(distance) {
			return (scale_size_unit * distance / scale_size_px).toFixed(3);
		}
		function drawDistances() {
			for(var i = 0; i < elements.length; i++) {
				var coords = elements[i][1].split(",");
				for(var a = 0; a < elements.length; a++) {
					var coords_target = elements[a][1].split(",");
					
					ctx.beginPath();
					ctx.moveTo(coords[0], coords[1]);
					ctx.lineTo(coords_target[0],coords_target[1]);
					ctx.lineWidth = 1;
					ctx.strokeStyle = "#FF6666";
					ctx.stroke();
				}
				
			}
		}
		function quickMeasure() {
			if(clickQueue.length == 0 && scale_size_unit != 0) {
				setCrosshairCursor();
				setHighlighted("quick_measure_btn");
				document.getElementById("quick_measure_btn").innerHTML = "Punto #1";
				clickQueue.push(function() {
					document.getElementById("quick_measure_btn").innerHTML = "Punto #2";
					first_point_x = coord_x;
					first_point_y = coord_y;
				});
				clickQueue.push(function() {
					resetHighlighted("quick_measure_btn");
					resetCursor();
					document.getElementById("quick_measure_btn").innerHTML = "Misura";
					var distance = computeDistance(first_point_x, first_point_y, coord_x, coord_y);
					console.log(distance);
					document.getElementById("quick_measure").innerHTML = pixelToUnit(distance) + " " + scale_unit;
				});
			} else if(clickQueue.length == 0 && scale_size_unit == 0) {
				alert("Scala non impostata")
			} else {
				alert("Prima di effettuare la misurazione è necessario terminare le altre operazioni.");
			}
		}
		function saveScale() {
			if(scale_size_unit != 0) {
				Cookies.set('scale_size_px', scale_size_px, { expires: 30 });
				Cookies.set('scale_size_unit', scale_size_unit, { expires: 30 });
				Cookies.set('scale_unit', scale_unit, { expires: 30 });
				alert("La scala è stata salvata nel cookie. Per eliminare la scala salvata, usare il tasto \"Reset cookie\".");
			} else {
				alert("Scala non impostata.");
			}
		}
		function resetCookie() {
			if(confirm("Sei sicuro?")) {
				Cookies.remove("scale_size_px");
				Cookies.remove("scale_size_unit");
				Cookies.remove("scale_unit");
				alert("Cookie cancellato.");
			}
		}
		function arrayToCsv(array) {
			var text = array.map(function(d){
				d = $.makeArray(d);
				return d.join();
			}).join('\n');
			
			var file = new File([text], prompt("Specificare un nome per il file .csv") + " .csv", {type: "text/plain;charset=utf-8"});
			saveAs(file);
		}
		function exportCanvas() {
			canvas.toBlob(function(blob) {
				saveAs(blob, prompt("Specificare un nome per il file .png") + " .png");
			});
		}
		function exportData() {
		  if(scale_size_unit != 0 && elements.length > 0) {
			var exportarray = [ ];
			if($("#min_dist").is(":checked")) {
				var inputarray = elements.slice(0);
				exportarray.push("Elemento,Distanza minima,Elemento più vicino,Indice di aggregazione");
				
				var total_distance = 0;
				for(i = 0; i < inputarray.length; i++) {
					var row = "";
					row += inputarray[i][0] + ",";
					
					var coords = inputarray[i][1].split(",");
					
					var minDistance;
					var nearestElementName;
					
					for(a = 0; a < inputarray.length; a++) {
						if(a == i) {
							continue;
						}
						var coords_target = inputarray[a][1].split(",");
						var dist = pixelToUnit(computeDistance(coords[0], coords[1], coords_target[0], coords_target[1]));
						if(minDistance == null || minDistance > dist) {
							minDistance = dist;
							nearestElementName = inputarray[a][0];
						}
						
					}
					row += minDistance + "," + nearestElementName;
					total_distance += parseFloat(minDistance);
					if(i == inputarray.length - 1) {
						row += "," + (total_distance / inputarray.length);
					} else {
						row += ",";
					}
					exportarray.push(row);
					minDistance = null;
				}
			} else if($("#all_dist").is(":checked")) {
				var inputarray = elements.slice(0);
				exportarray.push("Elemento 1,Elemento 2,Distanza,Distanza media");
				
				for(i = 0; i < inputarray.length; i++) {
					var total_distance = 0;
					var total_dist_counter = 0;
					var row = "";
					row += inputarray[i][0];
					
					var coords = inputarray[i][1].split(",");

					
					for(a = 0; a < inputarray.length; a++) {
						if(a == i && a != inputarray.length - 1) {
							continue;
						} else if(a != i) {
							var coords_target = inputarray[a][1].split(",");
							var dist = pixelToUnit(computeDistance(coords[0], coords[1], coords_target[0], coords_target[1]));
							row += "," + inputarray[a][0] + "," + dist;
							total_dist_counter++;
							total_distance += parseFloat(dist);
						} else {
						
						}
						if((a == inputarray.length - 1 && a != i) || (a == i - 1 && a == inputarray.length - 2)) {
							row += "," + (total_distance / total_dist_counter) + "\n";
						} else {
							row += ",\n";
						}
					}
					exportarray.push(row);
				}
			} else {
				exportarray = elements.slice(0);
				exportarray.unshift(["Nome elemento,Posizione X,Posizione Y", ""]);
				exportarray.push(["", ""]); // empty line
				exportarray.push(["Scala", ""]);
				exportarray.push([(scale_size_px + " pixel,=," + scale_size_unit + " " + scale_unit), ""]);
			}
			arrayToCsv(exportarray);
		  } else if(elements.length == 0) {
			alert("L'insieme degli elementi è vuoto.");
		  } else {
		    alert("Scala non impostata");
		  }
		}
	