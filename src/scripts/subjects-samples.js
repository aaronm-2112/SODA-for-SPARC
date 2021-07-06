var subjectsFormDiv = document.getElementById("form-add-a-subject");
var samplesFormDiv = document.getElementById("form-add-a-sample");
var subjectsTableData = [];
var subjectsFileData = [];
var samplesTableData = [];
var samplesFileData = [];
var headersArrSubjects = [];
var headersArrSamples = [];

function showForm(type, editBoolean) {
  if (type !== "edit") {
    clearAllSubjectFormFields(subjectsFormDiv);
  }
  subjectsFormDiv.style.display = "flex"
  $("#create_subjects-tab").removeClass("show");
  $("#create_subjects-tab").css("display", "none");
  $("#footer-div-subjects").css("display", "none");
  $("#btn-add-custom-field").show();
  $("#sidebarCollapse").prop("disabled", "true");
}

function showFormSamples(type, editBoolean) {
  if (samplesTableData.length > 1) {
    var samplesDropdownOptions = [];
    var subjectsDropdownOptions = [];
    for (var i=1; i<samplesTableData.length;i++) {
      samplesDropdownOptions.push(samplesTableData[i][1]);
      subjectsDropdownOptions.push(samplesTableData[i][0]);
    }
    if (!editBoolean) {
      // prompt users if they want to import entries from previous sub_ids
      Swal.fire({
        title: 'Would you like to re-use information from previous sample(s)?',
        showCancelButton: true,
        cancelButtonText: `No, start fresh!`,
        cancelButtonColor: "#f44336",
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Yes!'
      }).then((boolean) => {
        if (boolean.isConfirmed) {
          promptImportPrevInfoSamples(subjectsDropdownOptions, samplesDropdownOptions);
        } else {
          clearAllSubjectFormFields(samplesFormDiv);
        }
      })
    }
  } else {
    if (type !== "edit") {
      clearAllSubjectFormFields(samplesFormDiv);
    }
  }
  samplesFormDiv.style.display = "flex"
  $("#create_samples-tab").removeClass("show");
  $("#create_samples-tab").css("display", "none");
  $("#footer-div-samples").css("display", "none");
  $("#btn-add-custom-field-samples").show();
  $("#sidebarCollapse").prop("disabled", "true")
}

var selectHTML = "<div><select id='previous-subject' class='swal2-input' onchange='displayPreviousSample()'></select><select style='display:none' id='previous-sample' class='swal2-input' onchange='confirmSample()'></select></div>"
var prevSubID = "";
var prevSamID = "";

function promptImportPrevInfoSamples(arr1, arr2) {
  Swal.fire({
    title: 'Choose a previous sample:',
    html: selectHTML,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Confirm',
    customClass: {
      confirmButton: 'confirm-disabled'
    },
    onOpen: function() {
      $('.swal2-confirm').attr('id','btn-confirm-previous-import')
      removeOptions(document.getElementById("previous-subject"))
      removeOptions(document.getElementById("previous-sample"))
      $('#previous-subject').append(`<option value="Select">Select a subject</option>`);
      $('#previous-sample').append(`<option value="Select">Select a sample</option>`);
      for (var ele of arr1) {
        $('#previous-subject').append(`<option value="${ele}">${ele}</option>`);
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      if ($('#previous-subject').val() !== "Select" && $('#previous-sample').val() !== "Select") {
        populateFormsSamples(prevSubID, prevSamID, "import");
      }
    } else {
      hideSamplesForm()
    }
  })
}

function displayPreviousSample() {
  if ($("#previous-subject").val() !== "Select") {
    $("#previous-sample").css("display", "block");
    prevSubID = $("#previous-subject").val();
    // load previous sample ids accordingly for a particular subject
    var prevSampleArr = [];
    for (var subject of samplesTableData.slice(1)) {
      if (subject[0] === prevSubID) {
        prevSampleArr.push(subject[1])
      }
    }
    for (var ele of prevSampleArr) {
      $('#previous-sample').append(`<option value="${ele}">${ele}</option>`);
    }
  } else {
    $("#previous-sample").css("display", "none");
    prevSubID = ""
  }
}

function confirmSample() {
  if ($("#previous-sample").val() !== "Select") {
    $("#btn-confirm-previous-import").removeClass("confirm-disabled");
    prevSamID = $("#previous-sample").val()
  } else {
    $("#btn-confirm-previous-import").addClass("confirm-disabled")
    prevSamID = ""
  }
}

// for "Done adding" button - subjects
function addSubject() {
  var subjectID = $("#bootbox-subject-id").val();
  addSubjectIDtoDataBase(subjectID);
  if (subjectsTableData.length !== 0) {
    $("#div-import-primary-folder-sub").hide()
  }
}

// for "Done adding" button - samples
function addSample() {
  var sampleID = $("#bootbox-sample-id").val();
  var subjectID = $("#bootbox-subject-id-samples").val();
  addSampleIDtoDataBase(sampleID, subjectID);
  if (samplesTableData.length !== 0) {
    $("#div-import-primary-folder-sam").hide()
  }
}

function warningBeforeHideForm(type) {
  Swal.fire({
    title: "Are you sure you want to cancel?",
    text: "This will reset your progress with the current subject_id.",
    icon: "warning",
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: "Yes, cancel",
    cancelButtonText: "No, stay here",
    heightAuto: false,
    backdrop: "rgba(0,0,0, 0.4)",
  }).then((result) => {
    if (result.isConfirmed) {
      if (type === "subjects") {
        hideSubjectsForm()
      } else {
        hideSamplesForm()
      }
    }
  })
}

function hideSubjectsForm() {
  subjectsFormDiv.style.display = "none";
  $("#create_subjects-tab").addClass("show");
  $("#create_subjects-tab").css("display", "flex");
  $("#footer-div-subjects").css("display", "flex");
  $("#sidebarCollapse").prop("disabled", false);
  $("#btn-edit-subject").css("display", "none");
  $("#btn-add-subject").css("display", "inline-block");
}

function hideSamplesForm() {
  samplesFormDiv.style.display = "none";
  $("#create_samples-tab").addClass("show");
  $("#create_samples-tab").css("display", "flex");
  $("#footer-div-samples").css("display", "flex");
  $("#sidebarCollapse").prop("disabled", false);
  $("#btn-edit-sample").css("display", "none");
  $("#btn-add-sample").css("display", "inline-block");
}

function validateSubSamID(ev) {
    var regex = /^[a-zA-Z0-9-_]+$/;
    var id = $(ev).prop("id");
    var value = $("#"+id).val();
    //Validate TextBox value against the Regex.
    var isValid = regex.test(value);
    if (!isValid && value !== "") {
        $(ev).addClass("invalid");
        $("#para-"+id).css("display", "block");
    } else {
        $(ev).removeClass("invalid");
        $("#para-"+id).css("display", "none");
    }
}

function addNewIDToTable(newID, secondaryID, type) {
  var message = "";
  if (type === "subjects") {
    var keyword = "subject";
    var int = 1;
    var table = document.getElementById("table-subjects");
  } else if (type === "samples") {
    var keyword = "sample";
    var int = 2;
    var table = document.getElementById("table-samples");
  }
  var duplicate = false;
  var rowcount = table.rows.length;
  for (var i=1;i<rowcount;i++) {
    if (newID === table.rows[i].cells[int].innerText) {
      duplicate = true
      break
    }
  }
  if (duplicate) {
    var message = `We detect duplicate ${keyword}_id(s). Please make sure ${keyword}_id(s) are unique before you generate.`
  }
  var rowIndex = rowcount;
  var indexNumber = rowIndex;
  var currentRow = table.rows[table.rows.length - 1];
  // check for unique row id in case users delete old rows and append new rows (same IDs!)
  var newRowIndex = checkForUniqueRowID("row-current-"+keyword, rowIndex);
  if (type === "subjects") {
    var row = (table.insertRow(rowIndex).outerHTML =
    "<tr id='row-current-"+ keyword + newRowIndex +"' class='row-" +type+"'><td class='contributor-table-row'>"+indexNumber+"</td><td>"+newID+"</td><td><div class='ui small basic icon buttons contributor-helper-buttons' style='display: flex'><button class='ui button' onclick='edit_current_"+keyword+"_id(this)'><i class='pen icon' style='color: var(--tagify-dd-color-primary)'></i></button><button class='ui button' onclick='copy_current_"+keyword+"_id(this)'><i class='fas fa-copy' style='color: orange'></i></button><button class='ui button' onclick='delete_current_"+keyword+"_id(this)'><i class='trash alternate outline icon' style='color: red'></i></button></div></td></tr>");
  } else if (type === "samples") {
    var row = (table.insertRow(rowIndex).outerHTML =
    "<tr id='row-current-"+ keyword + newRowIndex +"' class='row-" +type+"'><td class='contributor-table-row'>"+indexNumber+"</td><td>"+secondaryID+"</td><td>"+newID+"</td><td><div class='ui small basic icon buttons contributor-helper-buttons' style='display: flex'><button class='ui button' onclick='edit_current_"+keyword+"_id(this)'><i class='pen icon' style='color: var(--tagify-dd-color-primary)'></i></button><button class='ui button' onclick='copy_current_"+keyword+"_id(this)'><i class='fas fa-copy' style='color: orange'></i></button><button class='ui button' onclick='delete_current_"+keyword+"_id(this)'><i class='trash alternate outline icon' style='color: red'></i></button></div></td></tr>");
  }
  return message
}

function addNewIDToTableStrict(newID, secondaryID, type) {
  var message = "";
  if (type === "subjects") {
    var keyword = "subject";
    var int = 1;
    var table = document.getElementById("table-subjects");
  } else if (type === "samples") {
    var keyword = "sample";
    var int = 2;
    var table = document.getElementById("table-samples");
  }
  var duplicate = false;
  var rowcount = table.rows.length;
  for (var i=1;i<rowcount;i++) {
    if (newID === table.rows[i].cells[int].innerText) {
      duplicate = true
      break
    }
  }
  if (duplicate) {
    var message = `We detect duplicate ${keyword}_id(s). Please make sure ${keyword}_id(s) are unique before you generate.`
  }
  return message
}

function addSubjectIDtoDataBase(id) {
  var table = document.getElementById("table-subjects");
  var duplicate = false;
  var error = "";
  var rowcount = table.rows.length;
  for (var i=1;i<rowcount;i++) {
    if (id === table.rows[i].cells[1].innerText) {
      duplicate = true
      break
    }
  }
  if (id !== "") {
    if (!duplicate) {
      var message = addNewIDToTable(id, null, "subjects")
      addSubjectIDToJSON(id);
    } else {
      error = "A similar subject_id already exists. Please either delete the existing subject_id or choose a different subject_id."
    }
  } else {
    error = "The subject_id is required to add a subject."
  }
    if (error !== "") {
    Swal.fire("Failed to add the subject", error, "error")
  }
}

function addSampleIDtoDataBase(samID, subID) {
  var table = document.getElementById("table-samples");
  var duplicate = false;
  var error = "";
  var rowcount = table.rows.length;
  for (var i=1;i<rowcount;i++) {
    if (samID === table.rows[i].cells[2].innerText) {
      duplicate = true
      break
    }
  }
  if (samID !== "" && subID !== "") {
    if (!duplicate) {
      var message = addNewIDToTable(samID, subID, "samples")
      addSampleIDtoJSON(samID);
    } else {
      error = "A similar sample_id already exists. Please either delete the existing sample_id or choose a different sample_id."
    }
  } else {
    error = "The subject_id and sample_id are required to add a sample."
    }
  if (error !== "") {
    Swal.fire("Failed to add the sample", error, "error")
  }
}

function clearAllSubjectFormFields(form) {
  for (var field of $(form).children().find("input")) {
    $(field).val("");
  }
  for (var field of $(form).children().find("select")) {
    $(field).val("Select");
  }
}

// add new subject ID to JSON file (main file to be converted to excel)
function addSubjectIDToJSON(subjectID) {
  if ($("#form-add-a-subject").length > 0) {
    addTheRestSubjectEntriesToJSON()
  }
}

// populate RRID
function populateRRID(strain, type) {
  var rridHostname = "scicrunch.org";
  // this is to handle spaces and other special characters in strain name
  var encodedStrain = encodeURIComponent(strain);
  var rridInfo = {
    hostname: rridHostname,
    port: 443,
    path: `/api/1/dataservices/federation/data/nlx_154697-1?q=${encodedStrain}&key=2YOfdcQRDVN6QZ1V6x3ZuIAsuypusxHD`,
    headers: { accept: "text/xml" },
  };
  Swal.fire({
    title: `Retrieving RRID for ${strain}...`,
    allowEscapeKey: false,
    allowOutsideClick: false,
    html:
      "Please wait...",
    timer: 10000,
    heightAuto: false,
    backdrop: "rgba(0,0,0, 0.4)",
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    },
  }).then((result) => {
  });
  https.get(rridInfo, (res) => {
    if (res.statusCode === 200) {
      let data = "";
      res.setEncoding('utf8');
      res.on("data", d => {
        data += d
      })
      res.on("end", () => {
        var returnRes = readXMLScicrunch(data, type);
        if (!returnRes) {
            Swal.fire({
              title: `Failed to retrieve the RRID for ${strain} from <a target="_blank" href="https://scicrunch.org/resources/Organisms/search">Scicrunch.org</a>.`,
              text: "Please make sure you enter the correct strain.",
              showCancelButton: false,
              heightAuto: false,
              backdrop: "rgba(0,0,0, 0.4)",
            })
            if (type === "subjects") {
              $("#bootbox-subject-strain").val("");
              $("#bootbox-subject-strain-RRID").val("");
            } else if (type === "samples") {
              $("#bootbox-sample-strain").val("");
              $("#bootbox-sample-strain-RRID").val("");
            }
          } else {
            Swal.fire(`Successfully retrieved the RRID for "${strain}".`, "", "success")
          }
      })
    } else {
      if (type === "subjects") {
        $("#bootbox-subject-strain").val("");
        $("#bootbox-subject-strain-RRID").val("");
      } else if (type === "samples") {
        $("#bootbox-sample-strain").val("");
        $("#bootbox-sample-strain-RRID").val("");
      }
      Swal.fire({
        title: `Failed to retrieve the RRID for "${strain}" from <a target="_blank" href="https://scicrunch.org/resources/Organisms/search">Scicrunch.org</a>.`,
        text: "Please check your Internet Connection or contact us at sodasparc@gmail.com",
        showCancelButton: false,
        heightAuto: false,
        backdrop: "rgba(0,0,0, 0.4)",
      })
    }
  })
}

function addTheRestSubjectEntriesToJSON() {
  var dataLength = subjectsTableData.length;
  var valuesArr = [];
  headersArrSubjects = [];
  for (var field of $("#form-add-a-subject").children().find(".subjects-form-entry")) {
    if (field.value === "" || field.value === undefined || field.value === "Select") {
      field.value  = null;
    }
    headersArrSubjects.push(field.name);
    // if it's age, then add age info input (day/week/month/year)
    if (field.name === "Age") {
      if ($("#bootbox-subject-age-info").val() !== "Select" && $("#bootbox-subject-age-info").val() !== "N/A") {
        field.value = field.value + " " + $("#bootbox-subject-age-info").val()
      } else {
        field.value = field.value
      }
    }
    valuesArr.push(field.value);
  }
  subjectsTableData[0] = headersArrSubjects
  if (valuesArr !== undefined && valuesArr.length !== 0) {
    if (subjectsTableData[dataLength] !== undefined) {
      subjectsTableData[dataLength + 1] = valuesArr
    } else {
      subjectsTableData[dataLength] = valuesArr
    }
  }
  $("#table-subjects").css("display", "block");
  $("#button-generate-subjects").css("display", "block");
  clearAllSubjectFormFields(subjectsFormDiv)
  hideSubjectsForm()
}

function addTheRestSampleEntriesToJSON() {
  var dataLength = samplesTableData.length;
  var valuesArr = [];
  headersArrSamples = [];
  for (var field of $("#form-add-a-sample").children().find(".samples-form-entry")) {
    if (field.value === "" || field.value === undefined || field.value === "Select") {
      field.value  = null;
    }
    headersArrSamples.push(field.name);
    // if it's age, then add age info input (day/week/month/year)
    if (field.name === "Age") {
      if ($("#bootbox-sample-age-info").val() !== "Select" && $("#bootbox-sample-age-info").val() !== "N/A") {
        field.value = field.value + " " + $("#bootbox-sample-age-info").val()
      } else {
        field.value = field.value
      }
    }
    valuesArr.push(field.value);
  }
  samplesTableData[0] = headersArrSamples
  if (valuesArr !== undefined && valuesArr.length !== 0) {
    if (samplesTableData[dataLength] !== undefined) {
      samplesTableData[dataLength + 1] = valuesArr
    } else {
      samplesTableData[dataLength] = valuesArr
    }
  }
  $("#table-samples").css("display", "block");
  $("#button-generate-samples").css("display", "block");
  clearAllSubjectFormFields(samplesFormDiv)
  hideSamplesForm()
}

function addSampleIDtoJSON(sampleID) {
  if ($("#form-add-a-sample").length > 0) {
    addTheRestSampleEntriesToJSON()
  }
}

// associated with the edit icon (edit a subject)
function edit_current_subject_id(ev) {
  var currentRow = $(ev).parents()[2];
  var subjectID = $(currentRow)[0].cells[1].innerText;
  loadSubjectInformation(ev, subjectID)
}
function edit_current_sample_id(ev) {
  var currentRow = $(ev).parents()[2];
  var subjectID = $(currentRow)[0].cells[1].innerText;
  var sampleID = $(currentRow)[0].cells[2].innerText;
  loadSampleInformation(ev, subjectID, sampleID)
}

function loadSubjectInformation(ev, subjectID) {
  // 1. load fields for form
  showForm("display", true);
  $("#btn-edit-subject").css("display", "inline-block");
  $("#btn-add-subject").css("display", "none");
  clearAllSubjectFormFields(subjectsFormDiv)
  populateForms(subjectID, "");
  $("#btn-edit-subject").unbind( "click" );
  $("#btn-edit-subject").click(function() {
    editSubject(ev, subjectID)
  })
  $("#new-custom-header-name").keyup(function () {
    var customName = $(this).val();
    if (customName !== "") {
      $("#button-confirm-custom-header-name").show();
    } else {
      $("#button-confirm-custom-header-name").hide();
    }
  })
}


 function populateForms(subjectID, type) {
   if (subjectID !== "clear" && subjectID !== "") {
     var infoJson = [];
     if (subjectsTableData.length > 1) {
       for (var i=1; i<subjectsTableData.length;i++) {
         if (subjectsTableData[i][0] === subjectID) {
           infoJson = subjectsTableData[i];
           break
         }
       }
     }
     // populate form
     var fieldArr = $(subjectsFormDiv).children().find(".subjects-form-entry")
     var emptyEntries = ["nan", "nat"]
     var c = fieldArr.map(function(i, field) {
       if (infoJson[i]) {
         if (!emptyEntries.includes(infoJson[i].toLowerCase())) {
           if (field.name === "Age") {
             var fullAge = infoJson[i].split(" ");
             var unitArr = ["hours", "days", "weeks", "months", "years"];
             var breakBoolean = false;
             field.value = fullAge[0];
             for (var unit of unitArr) {
               if (fullAge[1]) {
                 if (unit.includes(fullAge[1].toLowerCase())) {
                   $("#bootbox-subject-age-info").val(unit);
                   breakBoolean = true
                   break
                 }
                 if (!breakBoolean) {
                   $("#bootbox-subject-age-info").val("N/A")
                 }
               } else {
                 $("#bootbox-subject-age-info").val("N/A")
               }
             }
           } else {
              if (type === "import") {
                if (field.name === "subject_id") {
                  field.value = ""
                } else {
                  field.value = infoJson[i];
                }
              } else {
                field.value = infoJson[i];
              }
           }
         } else {
           field.value = "";
         }
       }
     });
   }
 }

 function populateFormsSamples(subjectID, sampleID, type) {
   if (sampleID !== "clear" && sampleID !== "") {
     var infoJson = [];
     if (samplesTableData.length > 1) {
       for (var i=1; i<samplesTableData.length;i++) {
         if (samplesTableData[i][1] === sampleID && samplesTableData[i][0] === subjectID) {
           infoJson = samplesTableData[i];
           break
         }
       }
     }
     // populate form
     var fieldArr = $(samplesFormDiv).children().find(".samples-form-entry")
     var emptyEntries = ["nan", "nat"]
     var c = fieldArr.map(function(i, field) {
       if (infoJson[i]) {
         if (!emptyEntries.includes(infoJson[i].toLowerCase())) {
           if (field.name === "Age") {
             var fullAge = infoJson[i].split(" ");
             var unitArr = ["hours", "days", "weeks", "months", "years"];
             var breakBoolean = false;
             field.value = fullAge[0];
             if (fullAge[1]) {
               for (var unit of unitArr) {
                 if (unit.includes(fullAge[1].toLowerCase())) {
                   $("#bootbox-sample-age-info").val(unit);
                   breakBoolean = true
                   break
                 }
                 if (!breakBoolean) {
                   $("#bootbox-sample-age-info").val("N/A")
                 }
               }
             } else {
               $("#bootbox-sample-age-info").val("N/A")
             }
           } else {
               if (type === "import") {
                 if (field.name === "subject_id") {
                   field.value = ""
                 } else if (field.name === "sample_id") {
                   field.value = ""
                 } else {
                    field.value = infoJson[i];
                 }
               } else {
                 field.value = infoJson[i];
               }
           }
         } else {
           field.value = "";
         }
       }
     });
   }
 }

 function loadSampleInformation(ev, subjectID, sampleID) {
   // 1. load fields for form
   showFormSamples("display", true);
   $("#btn-edit-sample").css("display", "inline-block");
   $("#btn-add-sample").css("display", "none");
   clearAllSubjectFormFields(samplesFormDiv)
   populateFormsSamples(subjectID, sampleID, "");
   $("#btn-edit-sample").unbind( "click" );
   $("#btn-edit-sample").click(function() {
     editSample(ev, sampleID)
   })
   $("#new-custom-header-name-samples").keyup(function () {
     var customName = $(this).val();
     if (customName !== "") {
       $("#button-confirm-custom-header-name-samples").show();
     } else {
       $("#button-confirm-custom-header-name-samples").hide();
     }
   })
}

function editSubject(ev, subjectID) {
 for (var field of $("#form-add-a-subject").children().find(".subjects-form-entry")) {
   if (field.value !== "" && field.value !== undefined && field.value !== "Select") {
     // if it's age, then add age info input (day/week/month/year)
     if (field.name === "Age") {
       if ($("#bootbox-subject-age-info").val() !== "Select") {
         field.value = field.value + " " + $("#bootbox-subject-age-info").val()
       }
     }
     subjectsFileData.push(field.value)
   } else {
     subjectsFileData.push("")
   }
 }
 var currentRow = $(ev).parents()[2];
 var newID = $("#bootbox-subject-id").val();
 if (newID === subjectID) {
   for (var i=1; i<subjectsTableData.length;i++) {
     if (subjectsTableData[i][0] === subjectID) {
       subjectsTableData[i] = subjectsFileData
       break
     }
   }
   hideSubjectsForm()
 } else {
    var table = document.getElementById("table-subjects");
    var duplicate = false;
    var error = "";
    var rowcount = table.rows.length;
    for (var i=1;i<rowcount;i++) {
      if (newID === table.rows[i].cells[1].innerText) {
        duplicate = true
        break
      }
    }
    if (duplicate) {
      error = "A similar subject_id already exists. Please either delete the existing subject_id or choose a different subject_id."
      Swal.fire("Duplicate subject_id", error, "error")
    } else {
      for (var i=1; i<subjectsTableData.length;i++) {
        if (subjectsTableData[i][0] === subjectID) {
          subjectsTableData[i] = subjectsFileData
          break
        }
      }
      $(currentRow)[0].cells[1].innerText = newID;
      hideSubjectsForm()
    }
  }
  subjectsFileData = []
}

function editSample(ev, sampleID) {
  for (var field of $("#form-add-a-sample").children().find(".samples-form-entry")) {
    if (field.value !== "" && field.value !== undefined && field.value !== "Select") {
      // if it's age, then add age info input (day/week/month/year)
      if (field.name === "Age") {
        if ($("#bootbox-sample-age-info").val() !== "Select" && $("#bootbox-sample-age-info").val() !== "N/A") {
          field.value = field.value + " " + $("#bootbox-sample-age-info").val()
        }
      }
      samplesFileData.push(field.value)
    } else {
      samplesFileData.push("")
    }
  }
  var currentRow = $(ev).parents()[2];
  var newID = $("#bootbox-sample-id").val();
  if (newID === sampleID) {
    for (var i=1; i<samplesTableData.length;i++) {
      if (samplesTableData[i][1] === sampleID) {
        samplesTableData[i] = samplesFileData
        break
      }
    }
    hideSamplesForm()
  } else {
    var table = document.getElementById("table-samples");
    var duplicate = false;
    var error = "";
    var rowcount = table.rows.length;
    for (var i=1;i<rowcount;i++) {
      if (newID === table.rows[i].cells[2].innerText) {
        duplicate = true
        break
      }
    }
     if (duplicate) {
       error = "A similar sample_id already exists. Please either delete the existing sample_id or choose a different sample_id."
       Swal.fire("Duplicate sample_id", error, "error")
     } else {
       for (var i=1; i<samplesTableData.length;i++) {
         if (samplesTableData[i][1] === sampleID) {
           samplesTableData[i] = samplesFileData
           break
         }
       }
       $(currentRow)[0].cells[2].innerText = newID;
       hideSamplesForm()
     }
   }
   samplesFileData = []
}

function delete_current_subject_id(ev) {
  Swal.fire({
    title: 'Are you sure you want to delete this subject?',
    showCancelButton: true,
    heightAuto: false,
    backdrop: "rgba(0,0,0, 0.4)",
    cancelButtonText: `No!`,
    cancelButtonColor: "#f44336",
    confirmButtonColor: '#3085d6',
    confirmButtonText: 'Yes'
  }).then((boolean) => {
    if (boolean.isConfirmed) {
      // 1. Delete from table
      var currentRow = $(ev).parents()[2];
      var currentRowid = $(currentRow).prop("id");
      document.getElementById(currentRowid).outerHTML = "";
      updateIndexForTable(document.getElementById("table-subjects"))
      // 2. Delete from JSON
      var subjectID = $(currentRow)[0].cells[1].innerText;
      for (var i=1; i<subjectsTableData.length; i++) {
        if (subjectsTableData[i][0] === subjectID) {
          subjectsTableData.splice(i, 1);
          break
        }
      }
    }
  })
}

function delete_current_sample_id(ev) {
  Swal.fire({
    title: 'Are you sure you want to delete this sample?',
    showCancelButton: true,
    heightAuto: false,
    backdrop: "rgba(0,0,0, 0.4)",
    cancelButtonText: `No!`,
    cancelButtonColor: "#f44336",
    confirmButtonColor: '#3085d6',
    confirmButtonText: 'Yes'
  }).then((boolean) => {
    if (boolean.isConfirmed) {
      // 1. Delete from table
      var currentRow = $(ev).parents()[2];
      var currentRowid = $(currentRow).prop("id");
      document.getElementById(currentRowid).outerHTML = "";
      updateIndexForTable(document.getElementById("table-samples"))
      // 2. Delete from JSON
      var sampleId = $(currentRow)[0].cells[2].innerText;
      for (var i=1; i<samplesTableData.length; i++) {
        if (samplesTableData[i][1] === sampleId) {
          samplesTableData.splice(i, 1);
          break
        }
      }
    }
  })
}

async function copy_current_subject_id(ev) {
  const { value: newSubject } = await Swal.fire({
  title: 'Copying information from this subject: ',
  text: "Enter an ID for the new subject: ",
  input: 'text',
  showCancelButton: true,
  inputValidator: (value) => {
    if (!value) {
      return 'Please enter an ID'
      }
    }
  })
  if (newSubject && newSubject !== "") {
    // // add new row to table
    var message = addNewIDToTableStrict(newSubject, null, "subjects")
    if (message !== "") {
      Swal.fire(message, "", "warning")
    } else {
      var res = addNewIDToTable(newSubject, null, "subjects")
      // add new subject_id to JSON
      // 1. copy from current ev.id (the whole array)
      var currentRow = $(ev).parents()[2];
      var id = currentRow.cells[1].innerText
      // 2. append that to the end of matrix
      for (var subArr of subjectsTableData.slice(1)) {
        if (subArr[0] === id) {
          var ind = subjectsTableData.indexOf(subArr);
          var newArr = [...subjectsTableData[ind]];
          subjectsTableData.push(newArr)
          // 3. change first entry of that array
          subjectsTableData[subjectsTableData.length - 1][0] = newSubject
          break
        }
      }
    }
  }
}

async function copy_current_sample_id(ev) {
  const { value: newSubSam } = await Swal.fire({
  title: 'Copying information from this sample: ',
  text: "Enter an ID for the new subject and sample: ",
  html:
    '<input id="new-subject" class="swal2-input" placeholder="Subject ID">' +
    '<input id="new-sample" class="swal2-input" placeholder="Sample ID">',
  focusConfirm: false,
  preConfirm: () => {
    return [
      document.getElementById('new-subject').value,
      document.getElementById('new-sample').value
    ]
    }
  })
  if (newSubSam && newSubSam[0] !== "" & newSubSam[1] !== "") {
    var message = addNewIDToTableStrict(newSubSam[1], newSubSam[0], "samples")
    if (message !== "") {
      Swal.fire(message, "", "warning")
    } else {
      var res = addNewIDToTable(newSubSam[1], newSubSam[0], "samples")
      // // add new row to table
      // add new subject_id to JSON
      // 1. copy from current ev.id (the whole array)
      var currentRow = $(ev).parents()[2];
      var id1 = currentRow.cells[1].innerText;
      var id2 = currentRow.cells[2].innerText;
      // 2. append that to the end of matrix
      for (var samArr of samplesTableData.slice(1)) {
        if (samArr[0] === id1 && samArr[1] === id2) {
          var ind = samplesTableData.indexOf(samArr);
          var newArr = [...samplesTableData[ind]];
          samplesTableData.push(newArr)
          // 3. change first entry of that array
          samplesTableData[samplesTableData.length - 1][0] = newSubSam[0]
          samplesTableData[samplesTableData.length - 1][1] = newSubSam[1]
          break
        }
      }
    }
  }
}

function updateIndexForTable(table) {
 // disable table to prevent further row-moving action before the updateIndexForTable finishes
 $("#table-subjects").css("pointer-events", "none");
 var rowcount = table.rows.length;
 var index = 1;
 for (var i=1;i<rowcount;i++) {
   table.rows[i].cells[0].innerText = index
   index = index + 1
 }
 if (rowcount === 1) {
   table.style.display = "none";
   if (table === document.getElementById("table-subjects")) {
     $("#button-generate-subjects").css("display", "none");
   } else if (table === document.getElementById("table-samples")) {
     $("#button-generate-samples").css("display", "none");
   }
 }
 $("#table-subjects").css("pointer-events", "auto");
}

function updateOrderIDTable(table, json, type) {
  var length = table.rows.length;
  // 1. make a new json object - orderedTableData
  var orderedTableData = [];
  // 2. add headers as the first array
  orderedTableData[0] = json[0];
  // 3. loop through the UI table by index -> grab subject_id accordingly, find subject_id in json, append that to orderedSubjectsTableData
  i = 1;
  for (var index = 1; index < length; index++) {
    var id = table.rows[index].cells[1].innerText;
    for (var ind of json.slice(1)) {
      if (ind[0] === id) {
        orderedTableData[i] = ind
        i += 1
        break
      }
    }
  }
  if (type === "subjects") {
    subjectsTableData = orderedTableData
  } else  if (type === "samples") {
    samplesTableData = orderedTableData
  }
}

function generateSubjects() {
 ipcRenderer.send("open-folder-dialog-save-subjects", "subjects.xlsx");
}

function generateSamples() {
 ipcRenderer.send("open-folder-dialog-save-samples", "samples.xlsx");
}

function showPrimaryBrowseFolder() {
  ipcRenderer.send("open-file-dialog-local-primary-folder");
}
function showPrimaryBrowseFolderSamples() {
  ipcRenderer.send("open-file-dialog-local-primary-folder-samples");
}

function importPrimaryFolderSubjects(folderPath) {
  headersArrSubjects = []
  for (var field of $("#form-add-a-subject").children().find(".subjects-form-entry")) {
    if (field.value === "" || field.value === undefined || field.value === "Select") {
      field.value = null
    }
    headersArrSubjects.push(field.name);
  }
  if (folderPath === "Browse here") {
    Swal.fire("No folder chosen", "Please select a path to your primary folder", "error");
  } else {
    if (path.parse(folderPath).base !== "primary") {
      Swal.fire("Incorrect folder name", "Your folder must be named 'primary' to be imported to SODA.", "error");
    } else {
      var folders = fs.readdirSync(folderPath);
      var j = 1;
      subjectsTableData[0] = headersArrSubjects;
      for (var folder of folders) {
        subjectsFileData = []
        var stats = fs.statSync(path.join(folderPath, folder));
        if (stats.isDirectory()) {
          subjectsFileData[0] = folder
          for (var i=1; i<18; i++) {
            subjectsFileData.push("")
          }
          subjectsTableData[j] = subjectsFileData
          j += 1
        }
      }
      subjectsFileData = []
      var subIDArray = [];
      // grab and confirm with users about their sub-ids
      for (var index of subjectsTableData.slice(1)) {
        subIDArray.push(index[0])
      }
      Swal.fire({
        title: "Please confirm the subject id(s) below:",
        text: "The subject_ids are: " + subIDArray.join(", "),
        icon: "warning",
        heightAuto: false,
        backdrop: "rgba(0,0,0, 0.4)",
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: "Yes, correct",
        cancelButtonText: "No",
        heightAuto: false,
        backdrop: "rgba(0,0,0, 0.4)",
      }).then((result) => {
        if (result.isConfirmed) {
          if (subjectsTableData.length > 1) {
            loadSubjectsDataToTable();
            $("#table-subjects").show();
            $("#div-import-primary-folder-sub").hide()
          } else {
            Swal.fire(
              'Could not load subject IDs from the imported primary folder!',
              'Please check that you provided the correct path to a SPARC primary folder that has at least 1 subject folder.',
              'error')
            }
        }
      })
    }
  }
}
function importPrimaryFolderSamples(folderPath) {
  headersArrSamples = []
  for (var field of $("#form-add-a-sample").children().find(".samples-form-entry")) {
    if (field.value === "" || field.value === undefined || field.value === "Select") {
      field.value = null
    }
    headersArrSamples.push(field.name);
  }
  // var folderPath = $("#primary-folder-destination-input-samples").prop("placeholder");
  if (folderPath === "Browse here") {
    Swal.fire("No folder chosen", "Please select a path to your primary folder.", "error");
  } else {
    if (path.parse(folderPath).base !== "primary") {
      Swal.fire("Incorrect folder name", "Your folder must be named 'primary' to be imported to SODA.", "error");
    } else {
      var folders = fs.readdirSync(folderPath);
      var j = 1;
      samplesTableData[0] = headersArrSamples;
      for (var folder of folders) {
        samplesFileData = []
        var statsSubjectID = fs.statSync(path.join(folderPath, folder));
        if (statsSubjectID.isDirectory()) {
          samplesFileData[0] = folder
          var subjectFolder = fs.readdirSync(path.join(folderPath, folder));
          for (var subfolder of subjectFolder) {
            var statsSampleID = fs.statSync(path.join(folderPath, folder, subfolder))
            if (statsSampleID.isDirectory()) {
              samplesFileData[1] = subfolder
            }
          }
          for (var i=2; i<22; i++) {
            samplesFileData.push("")
          }
          samplesTableData[j] = samplesFileData
          j += 1
        }
      }
      samplesFileData = []
      var subIDArray = [];
      var samIDArray = [];
      // grab and confirm with users about their sub-ids
      for (var index of samplesTableData.slice(1)) {
        subIDArray.push(index[0]);
        samIDArray.push(index[1]);
      }
      Swal.fire({
        title: "Please confirm the subject id(s) and sample id(s) below:",
        html: "The subject_id(s) are: " + subIDArray.join(", ") + "<br> The sample_id(s) are: " + samIDArray.join(", "),
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: "Yes, correct",
        cancelButtonText: "No",
        heightAuto: false,
        backdrop: "rgba(0,0,0, 0.4)",
      }).then((result) => {
        if (result.isConfirmed) {
          if (samplesTableData.length > 1) {
            loadSamplesDataToTable();
            $("#table-samples").show();
            $("#div-import-primary-folder-sam").hide()
            // $("#div-confirm-primary-folder-import-samples").hide();
            // $("#button-fake-confirm-primary-folder-load-samples").click();
          } else {
            Swal.fire(
              'Could not load samples IDs from the imported primary folder!',
              'Please check that you provided the correct path to a SPARC primary folder that has at least 1 subject folder and 1 sample folder.',
              'error')
            }
        }
      })
    }
  }
}

function loadSubjectsDataToTable() {
  var iconMessage = "success";
  var showConfirmButtonBool = false;
  var text = 'Please add or edit your subject_id(s) in the following subjects table.';
  // delete table rows except headers
  $("#table-subjects tr:gt(0)").remove();
  for (var i=1; i<subjectsTableData.length; i++) {
    var message = addNewIDToTable(subjectsTableData[i][0], null, "subjects")
  }
  if (message !== "") {
    Swal.fire({
      title: 'Loaded successfully!',
      text: message,
      icon: "warning",
      showConfirmButton: true,
    })
  } else {
    Swal.fire({
      title: 'Loaded successfully!',
      text: 'Please add or edit your subject_id(s) in the following subjects table.',
      icon: "success",
      showConfirmButton: true,
    })
  }
  Swal.fire({
  title: 'Loaded successfully!',
  text: text,
  icon: iconMessage,
  showConfirmButton: showConfirmButtonBool,
  timer: 1200,
  })
  $("#button-generate-subjects").css("display", "block");
  $("#div-import-primary-folder-sub").hide()
}

function loadSamplesDataToTable() {
  // delete table rows except headers
  $("#table-samples tr:gt(0)").remove();
  for (var i=1; i<samplesTableData.length; i++) {
    var message = addNewIDToTable(samplesTableData[i][1], samplesTableData[i][0], "samples")
  }
  if (message !== "") {
    Swal.fire({
      title: 'Loaded successfully!',
      text: message,
      icon: "warning",
      showConfirmButton: true,
    })
  } else {
    Swal.fire({
      title: 'Loaded successfully!',
      text: 'Please add or edit your sample_id(s) in the following samples table.',
      icon: "success",
      showConfirmButton: false,
      timer: 1200
    })
  }
  $("#button-generate-samples").css("display", "block");
  $("#div-import-primary-folder-sam").hide()
}

function resetSubjects() {
  Swal.fire({
    text: "Are you sure you want to start over and reset your progress?",
    icon: "warning",
    showCancelButton: true,
    heightAuto: false,
    backdrop: "rgba(0,0,0, 0.4)",
    confirmButtonText: "I want to start over",
  }).then((result) => {
    if (result.isConfirmed) {
      // 1. remove Prev and Show from all individual-question except for the first one
      // 2. empty all input, textarea, select, para-elements
      $("#Question-prepare-subjects-1").removeClass("prev");
      $("#Question-prepare-subjects-1").nextAll().removeClass("show");
      $("#Question-prepare-subjects-1").nextAll().removeClass("prev");
      $("#Question-prepare-subjects-1 .option-card").removeClass("checked").removeClass("disabled").removeClass("non-selected");
      $("#Question-prepare-subjects-1 .option-card .folder-input-check").prop("checked", false);
      $("#Question-prepare-subjects-2").find("button").show()
      $("#div-confirm-primary-folder-import").find("button").hide()

      $("#Question-prepare-subjects-primary-import").find("input").prop("placeholder", "Browse here")
      subjectsFileData = []
      subjectsTableData = []

      // delete custom fields (if any)
      var fieldLength = $(".subjects-form-entry").length;
      if (fieldLength > 18) {
        for (var field of $(".subjects-form-entry").slice(18, fieldLength)) {
          $($(field).parents()[2]).remove()
        }
      }

      // delete table rows except headers
      $("#table-subjects tr:gt(0)").remove();
      $("#table-subjects").css("display", "none")
      // Hide Generate button
      $("#button-generate-subjects").css("display", "none")
    }
  });
}

function resetSamples() {
  Swal.fire({
    text: "Are you sure you want to start over and reset your progress?",
    icon: "warning",
    showCancelButton: true,
    heightAuto: false,
    backdrop: "rgba(0,0,0, 0.4)",
    confirmButtonText: "I want to start over",
  }).then((result) => {
    if (result.isConfirmed) {
      // 1. remove Prev and Show from all individual-question except for the first one
      // 2. empty all input, textarea, select, para-elements
      $("#Question-prepare-samples-1").removeClass("prev");
      $("#Question-prepare-samples-1").nextAll().removeClass("show");
      $("#Question-prepare-samples-1").nextAll().removeClass("prev");
      $("#Question-prepare-samples-1 .option-card").removeClass("checked").removeClass("disabled").removeClass("non-selected");
      $("#Question-prepare-samples-1 .option-card .folder-input-check").prop("checked", false);
      $("#Question-prepare-samples-2").find("button").show()
      $("#div-confirm-primary-folder-import-samples").find("button").hide()

      $("#Question-prepare-subjects-primary-import-samples").find("input").prop("placeholder", "Browse here")
      samplesFileData = []
      samplesTableData = []

      // delete custom fields (if any)
      var fieldLength = $(".samples-form-entry").length;
      if (fieldLength > 21) {
        for (var field of $(".samples-form-entry").slice(21, fieldLength)) {
          $($(field).parents()[2]).remove()
        }
      }

      // delete table rows except headers
      $("#table-samples tr:gt(0)").remove();
      $("#table-samples").css("display", "none")
      // Hide Generate button
      $("#button-generate-samples").css("display", "none")
    }
  });
}

// functions below are to show/add/cancel a custom header
async function addCustomField(type) {
  if (type === "subjects") {
    var lowercaseCasedArray = $.map(headersArrSubjects, function(item, index) {
      return item.toLowerCase();
    });
    const { value: customField } = await Swal.fire({
            title: 'Enter a custom field:',
            input: 'text',
            showCancelButton: true,
            inputValidator: (value) => {
              if (!value) {
                return "Please enter a custom field"
              } else {
                  if (lowercaseCasedArray.includes(value.toLowerCase())) {
                    return "Duplicate field name! <br> You entered a custom field that is already listed."
                  }
              }
            }
          })
    if (customField) {
      addCustomHeader("subjects", customField)
    }
  } else if (type === "samples") {
    var lowercaseCasedArray = $.map(headersArrSamples, function(item, index) {
      return item.toLowerCase();
    });
    const { value: customField } = await Swal.fire({
            title: 'Enter a custom field:',
            input: 'text',
            showCancelButton: true,
            inputValidator: (value) => {
              if (!value) {
                return "Please enter a custom field"
              } else {
                  if (headersArrSamples.includes(value.toLowerCase())) {
                    return "Duplicate field name! <br> You entered a custom field that is already listed."
                  }
              }
            }
          })
    if (customField) {
      addCustomHeader("samples", customField)
    }
  }
}

function addCustomHeader(type, customHeaderValue) {
  var customName = customHeaderValue.trim();
  if (type === "subjects") {
    var divElement = '<div class="div-dd-info"><div class="demo-controls-head"><div style="width: 100%;"><font color="black">'+customName+':</font></div></div><div class="demo-controls-body"><div class="ui input modified"><input class="subjects-form-entry" type="text" placeholder="Type here..." id="bootbox-subject-'+customName+'" name="'+customName+'"></input></div></div><div class="tooltipnew demo-controls-end"><svg onclick="deleteCustomField(this, \''+customName+'\', 0)" style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-trash custom-fields" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></div></div>'
    $("#accordian-custom-fields").append(divElement);
    headersArrSubjects.push(customName);
    // add empty entries for all of the other sub_ids to normalize the size of matrix
    for (var subId of subjectsTableData.slice(1, subjectsTableData.length)) {
      subId.push("");
    }
  } else if (type === "samples") {
    var divElement = '<div class="div-dd-info"><div class="demo-controls-head"><div style="width: 100%;"><font color="black">'+customName+':</font></div></div><div class="demo-controls-body"><div class="ui input modified"><input class="samples-form-entry" type="text" placeholder="Type here..." id="bootbox-subject-'+customName+'" name="'+customName+'"></input></div></div><div class="tooltipnew demo-controls-end"><svg onclick="deleteCustomField(this, \''+customName+'\', 1)" style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-trash custom-fields" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></div></div>'
    $("#accordian-custom-fields-samples").append(divElement);
    headersArrSamples.push(customName);
    // add empty entries for all of the other sub_ids to normalize the size of matrix
    for (var sampleId of samplesTableData.slice(1, samplesTableData.length)) {
      sampleId.push("");
    }
  }
}

function deleteCustomField(ev, customField, category) {
  //  category 0 => subjects;
  // category 1 => samples
  Swal.fire({
    text: "Are you sure you want to delete this custom field?",
    icon: "warning",
    showCancelButton: true,
    heightAuto: false,
    backdrop: "rgba(0,0,0, 0.4)",
    confirmButtonText: "Yes",
  }).then((result) => {
    if (result.isConfirmed) {
      $(ev).parents()[1].remove();
      if (category === 0) {
        if (headersArrSubjects.includes(customField)) {
          headersArrSubjects.splice(headersArrSubjects.indexOf(customField), 1)
        }
      } else {
        if (headersArrSamples.includes(customField)) {
          headersArrSamples.splice(headersArrSamples.indexOf(customField), 1)
        }
      }
    }
  })
}


function addExistingCustomHeader(customName) {
  var divElement = '<div class="div-dd-info"><div class="demo-controls-head"><div style="width: 100%;"><font color="black">'+customName+':</font></div></div><div class="demo-controls-body"><div class="ui input"><input class="subjects-form-entry" type="text" placeholder="Type here..." id="bootbox-subject-'+customName+'" name="'+customName+'"></input></div></div><div class="tooltipnew demo-controls-end"><svg onclick="deleteCustomField(this, \''+customName+'\', 0)" style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-trash custom-fields" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></div></div>'
  $("#accordian-custom-fields").append(divElement);
  headersArrSubjects.push(customName);
}

function addExistingCustomHeaderSamples(customName) {
  var divElement = '<div class="div-dd-info"><div class="demo-controls-head"><div style="width: 100%;"><font color="black">'+customName+':</font></div></div><div class="demo-controls-body"><div class="ui input"><input class="samples-form-entry" type="text" placeholder="Type here..." id="bootbox-subject-'+customName+'" name="'+customName+'"></input></div></div><div class="tooltipnew demo-controls-end"><svg onclick="deleteCustomField(this, \''+customName+'\', 1)" style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-trash custom-fields" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></div></div>'
  $("#accordian-custom-fields-samples").append(divElement);
  headersArrSamples.push(customName);
}

$(document).ready(function() {
  loadExistingProtocolInfo()
  for (var field of $("#form-add-a-subject").children().find(".subjects-form-entry")) {
    if (field.value === "" || field.value === undefined || field.value === "Select") {
      field.value = null
    }
    headersArrSubjects.push(field.name);
  }
  for (var field of $("#form-add-a-sample").children().find(".samples-form-entry")) {
    if (field.value === "" || field.value === undefined || field.value === "Select") {
      field.value = null
    }
    headersArrSamples.push(field.name);
  }

  ipcRenderer.on("selected-existing-subjects", (event, filepath) => {
    if (filepath.length > 0) {
      if (filepath != null) {
        document.getElementById("existing-subjects-file-destination").placeholder =
          filepath[0];
        ipcRenderer.send(
          "track-event",
          "Success",
          "Prepare Metadata - Continue with existing subjects.xlsx",
          defaultBfAccount
        );
      }
    }
    if (
      document.getElementById("existing-subjects-file-destination").placeholder !==
      "Browse here"
    ) {
      $("#div-confirm-existing-subjects-import").show();
      $($("#div-confirm-existing-subjects-import button")[0]).show();
    } else {
      $("#div-confirm-existing-subjects-import").hide();
      $($("#div-confirm-existing-subjects-import button")[0]).hide();
    }
  });

  ipcRenderer.on("selected-existing-samples", (event, filepath) => {
    if (filepath.length > 0) {
      if (filepath != null) {
        document.getElementById("existing-samples-file-destination").placeholder =
          filepath[0];
        ipcRenderer.send(
          "track-event",
          "Success",
          "Prepare Metadata - Continue with existing samples.xlsx",
          defaultBfAccount
        );
      }
    }
    if (
      document.getElementById("existing-samples-file-destination").placeholder !==
      "Browse here"
    ) {
      $("#div-confirm-existing-samples-import").show();
      $($("#div-confirm-existing-samples-import button")[0]).show();
    } else {
      $("#div-confirm-existing-samples-import").hide();
      $($("#div-confirm-existing-samples-import button")[0]).hide();
    }
  });
})

function showExistingSubjectsFile() {
  ipcRenderer.send("open-file-dialog-existing-subjects");
}

function showExistingSamplesFile() {
  ipcRenderer.send("open-file-dialog-existing-samples");
}

function importExistingSubjectsFile() {
  var filePath = $("#existing-subjects-file-destination").prop("placeholder");
  if (filePath === "Browse here") {
    Swal.fire("No file chosen", "Please select a path to your subjects.xlsx file,", "error");
  } else {
    if (path.parse(filePath).base !== "subjects.xlsx") {
      Swal.fire("Incorrect file name", "Your file must be named 'subjects.xlsx' to be imported to SODA.", "error");
    } else {
      Swal.fire({
        title: "Loading an existing subjects.xlsx file",
        html:
          "Please wait...",
        timer: 2000,
        allowEscapeKey: false,
        allowOutsideClick: false,
        heightAuto: false,
        backdrop: "rgba(0,0,0, 0.4)",
        timerProgressBar: false,
        didOpen: () => {
          Swal.showLoading();
        },
      }).then((result) => {
      });
      setTimeout(loadSubjectsFileToDataframe(filePath), 1000)
    }
  }
}

function importExistingSamplesFile() {
  var filePath = $("#existing-samples-file-destination").prop("placeholder");
  if (filePath === "Browse here") {
    Swal.fire("No file chosen", "Please select a path to your samples.xlsx file.", "error");
  } else {
    if (path.parse(filePath).base !== "samples.xlsx") {
      Swal.fire("Incorrect file name", "Your file must be named 'samples.xlsx' to be imported to SODA.", "error");
    } else {
      Swal.fire({
        title: "Loading an existing samples.xlsx file",
        allowEscapeKey: false,
        allowOutsideClick: false,
        html:
          "Please wait...",
        timer: 1500,
        heightAuto: false,
        backdrop: "rgba(0,0,0, 0.4)",
        timerProgressBar: false,
        didOpen: () => {
          Swal.showLoading();
        },
      }).then((result) => {
      });
      setTimeout(loadSamplesFileToDataframe(filePath), 1000)
    }
  }
}

function loadDataFrametoUI() {
  var fieldSubjectEntries = []
  for (var field of $("#form-add-a-subject").children().find(".subjects-form-entry")) {
    fieldSubjectEntries.push(field.name.toLowerCase())
  }
  // separate regular headers and custom headers
  const lowercasedHeaders = subjectsTableData[0].map(header => header.toLowerCase());
  const customHeaders = [];
  for (var field of lowercasedHeaders) {
    if (!fieldSubjectEntries.includes(field)) {
      customHeaders.push(field)
    }
  }
  headersArrSubjects = headersArrSubjects.concat(customHeaders);
  for (var headerName of customHeaders) {
    addExistingCustomHeader(headerName)
  }
  // load sub-ids to table
  loadSubjectsDataToTable()
  $("#table-subjects").show();
  $("#button-fake-confirm-existing-subjects-file-load").click();
}

function loadDataFrametoUISamples() {
  // separate regular headers and custom headers
  const lowercasedHeaders = samplesTableData[0].map(header => header.toLowerCase());
  var fieldSampleEntries = []
  for (var field of $("#form-add-a-sample").children().find(".samples-form-entry")) {
    fieldSampleEntries.push(field.name.toLowerCase())
  }
  const customHeaders = [];
  for (var field of lowercasedHeaders) {
    if (!fieldSampleEntries.includes(field)) {
      customHeaders.push(field)
    }
  }
  headersArrSamples = headersArrSamples.concat(customHeaders);
  for (var headerName of customHeaders) {
    addExistingCustomHeaderSamples(headerName)
  }
  // load sub-ids to table
  loadSamplesDataToTable()
  $("#table-samples").show();
  $("#button-fake-confirm-existing-samples-file-load").click();
}

function preliminaryProtocolStep() {
  Swal.fire({
    title: 'Do you have an account with protocol.io?',
    showCancelButton: true,
    heightAuto: false,
    backdrop: "rgba(0,0,0, 0.4)",
    confirmButtonText: '<a target="_blank" href="https://www.protocols.io/developers" style="color:#fff;border-bottom:none">Yes, I do</a>',
    cancelButtonText: "No, I don't",
    allowEscapeKey: false,
    allowOutsideClick: false,
  }).then((result) => {
  if (result.isConfirmed) {
    setTimeout(function() {
      connectProtocol()
    }, 1500)
  } else {
    Swal.fire("Please create an account with protocol.io.", "SODA suggests you create an account with protocols.io first. For help with creating and sharing a protocol with SPARC, please visit <a target='_blank' href='https://sparc.science/help/1slXZSS2XtTYQsdY6mEJi5'>this dedicated webpage</a>.", "warning")
    }
  })
}

async function connectProtocol() {
  const { value: protocolCredentials } = await Swal.fire({
  width: "fit-content",
  title: "Once you're signed in, grab your <i>private access token</i> and enter it below: ",
  html:
    '<div class="ui input" style="margin: 10px 0"><i style="margin-top: 12px; margin-right:10px; font-size:20px" class="lock icon"></i><input type="text" id="protocol-password" class="subjects-form-entry" placeholder="Private access token" style="padding-left:5px"></div>',
  imageUrl: '../docs/documentation/Prepare-metadata/subjects/protocol-info.png',
  imageWidth: 450,
  imageHeight: 200,
  imageAlt: 'Custom image',
  focusConfirm: false,
  confirmButtonText: "Let's connect",
  showCancelButton: true,
  showLoaderOnConfirm: true,
  heightAuto: false,
  allowEscapeKey: false,
  allowOutsideClick: false,
  backdrop: "rgba(0,0,0, 0.4)",
  preConfirm: () => {
    var res =
      document.getElementById('protocol-password').value;
    if (res) {
      return res
    } else {
      Swal.showValidationMessage("Please provide a access token to connect.");
      return false
    }
  }
  })
  if (protocolCredentials) {
    sendHttpsRequestProtocol(protocolCredentials, "first-time")
  }
}

const protocolHostname = "protocols.io";
var protocolResearcherList = {};

function sendHttpsRequestProtocol(accessToken, type) {
  var protocolList = {}
  var protocolInfo = {
    hostname: protocolHostname,
    port: 443,
    path: `/api/v3/session/profile`,
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  https.get(protocolInfo, (res) => {
    if (res.statusCode === 200) {
      res.setEncoding('utf8');
      res.on('data', async function (body) {
        var bodyRes = JSON.parse(body)
        saveProtocolInfo(accessToken);
        await grabResearcherProtocolList(bodyRes.user.username, accessToken, type)
      });
    } else {
      if (type === "first-time") {
        Swal.fire("Failed to connect with protocol.io", "Please check your access token and try again.", "error")
      }
    }
  })
}

function grabResearcherProtocolList(username, token, type) {
  var protocolInfoList = {
    hostname: protocolHostname,
    port: 443,
    path: `/api/v3/researchers/${username}/protocols?filter="user_all"`,
    headers: { Authorization: `Bearer ${token}` },
  };
  https.get(protocolInfoList, (res) => {
    if (res.statusCode === 200) {
      res.setEncoding('utf8');
      res.on('data', function (body) {
        var result = JSON.parse(body)
        protocolResearcherList = {};
        $("#bootbox-subject-protocol-location").val("");
        $("#bootbox-subject-protocol-title").prop("placeholder", "Search here");
        $("#bootbox-sample-protocol-title").val("");
        $("#bootbox-sample-protocol-location").prop("placeholder", "Search here");
        $("#bootbox-subject-protocol-title").val("");
        $("#bootbox-sample-protocol-title").val("");
        for (var item of result["items"]) {
          protocolResearcherList[item.title] = "https://www.protocols.io/view/" + item.uri;
        }
        if (Object.keys(protocolResearcherList).length > 0) {
          populateProtocolDropdown("subjects");
          populateProtocolDropdown("samples")
          if (type==="first-time") {
            Swal.fire({
              title: "Successfully connected! <br/>Loading your protocol information...",
              timer: 2000,
              timerProgressBar: true,
              allowEscapeKey: false,
              heightAuto: false,
              backdrop: "rgba(0,0,0, 0.4)",
              showConfirmButton: false,
              allowOutsideClick: false,
            })
          }
        } else {
          if (type==="first-time") {
            Swal.fire("Successfully connected", "However, at this moment, you do not have any protocol information for SODA to extract.", "success")
          }
        }
      });
    }
  })
}

function populateProtocolDropdown(type) {
  if (type === "subjects") {
    $($("#bootbox-subject-protocol-title").parents()[0]).remove();
      var divElement = '<div class="ui input"><select id="bootbox-subject-protocol-title" class="ui selection dropdown subjects-form-entry" onchange="autoPopulateProtocolLink(this, \''+type+'\')" name="Protocol title"></select></div>'
      $("#subjects-protocol-titles").prepend(divElement);
      // populate dropdown with protocolResearcherList
      removeOptions(document.getElementById("bootbox-subject-protocol-title"));
      addOption(document.getElementById("bootbox-subject-protocol-title"), "Select protocol", "Select")
      for (var key of Object.keys(protocolResearcherList)) {
        $('#bootbox-subject-protocol-title').append('<option value="' + key + '">' + key + '</option>');
      }
   } else {
     $($("#bootbox-sample-protocol-title").parents()[0]).remove();
       var divElement = '<div class="ui input"><select id="bootbox-sample-protocol-title" class="ui selection dropdown samples-form-entry" onchange="autoPopulateProtocolLink(this, \''+type+'\')" name="Protocol title"></select></div>'
       $("#samples-protocol-titles").prepend(divElement);
       // populate dropdown with protocolResearcherList
       removeOptions(document.getElementById("bootbox-sample-protocol-title"));
       addOption(document.getElementById("bootbox-sample-protocol-title"), "Select protocol", "Select")
       for (var key of Object.keys(protocolResearcherList)) {
         $('#bootbox-sample-protocol-title').append('<option value="' + key + '">' + key + '</option>');
       }
   }
}

function autoPopulateProtocolLink(ev, type) {
  var linkVal = $(ev).val();
  if (linkVal && linkVal !== "Select") {
    for (var key of Object.keys(protocolResearcherList)) {
      if (key === linkVal) {
        if (type === "subjects") {
          $("#bootbox-subject-protocol-location").val(protocolResearcherList[key])
        } else {
          $("#bootbox-sample-protocol-location").val(protocolResearcherList[key])
        }
        break
      }
    }
  } else {
    if (type === "subjects") {
      $("#bootbox-subject-protocol-location").val("")
    } else {
      $("#bootbox-sample-protocol-location").val("")
    }
  }
}

function saveProtocolInfo(token){
  var content = parseJson(protocolConfigPath);
  content["access-token"] = token;
  fs.writeFileSync(protocolConfigPath, JSON.stringify(content));
}

function loadExistingProtocolInfo() {
  //// config and load live data from Airtable
  var protocolTokenContent = parseJson(protocolConfigPath);
  if (JSON.stringify(protocolTokenContent) !== "{}") {
    var protocolToken = protocolTokenContent["access-token"];
    if (protocolToken !== "") {
      sendHttpsRequestProtocol(protocolToken, "upon-loading")
    }
  }
}

function showAgeSection(ev, div, type) {
  var allDivsArr = [];
  if (type === "subjects") {
    allDivsArr = ["div-exact-age", "div-age-category", "div-age-range"];
  } else {
    allDivsArr = ["div-exact-age-samples", "div-age-category-samples", "div-age-range-samples"];
  }
  allDivsArr.splice(allDivsArr.indexOf(div), 1);
  if ($("#"+div).hasClass("hidden")) {
    $("#"+div).removeClass("hidden")
  }
  $(".age.ui").removeClass("positive active");
  $(ev).addClass("positive active")
  for (var divEle of allDivsArr) {
    $("#"+divEle).addClass("hidden")
  }
}

function readXMLScicrunch(xml, type) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(xml,"text/xml");
  var resultList = xmlDoc.getElementsByTagName('name');       // THE XML TAG NAME.
  var rrid = "";
  var res;
  for (var i = 0; i < resultList.length; i++) {
    if (resultList[i].childNodes[0].nodeValue === "Proper Citation") {
      rrid = resultList[i].nextSibling.childNodes[0].nodeValue;
      break
    }
  }
  if (type === "subjects") {
    if (rrid !== "") {
      $("#bootbox-subject-strain-RRID").val(rrid)
      res = true
    } else {
      $("#bootbox-subject-strain-RRID").val("")
      res = false
    }
  } else {
    if (rrid !== "") {
      $("#bootbox-sample-strain-RRID").val(rrid)
      res = true
    } else {
      $("#bootbox-sample-strain-RRID").val("")
      res = false
    }
  }
  return res
};
