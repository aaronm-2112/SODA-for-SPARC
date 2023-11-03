// this variable is here to keep track of when the Organize datasets/Continue button is enabled or disabled
document.body.addEventListener("click", (event) => {
  if (event.target.dataset.section) {
    handleSectionTrigger(event);
  } else if (event.target.dataset.modal) {
    handleModalTrigger(event);
  } else if (event.target.classList.contains("modal-hide")) {
    hideAllModals();
  }
});

document.body.addEventListener("custom-back", (e) => {
  handleSectionTrigger(e);
});
// Variable used to determine the disabled status of the organize datasets next button
let boolNextButtonDisabled = true;

const handleSectionTrigger = async (event) => {
  // Display the current section
  const sectionId = `${event.target.dataset.section}-section`;
  const itemsContainer = document.getElementById("items");
  const freeFormItemsContainer = document.getElementById("free-form-folder-structure-container");
  const freeFormButtons = document.getElementById("organize-path-and-back-button-div");
  const sectionRenderFileExplorer = event.target.dataset.render;

  if (sectionId === "organize-section") {
    //reset lazyloading values
    resetLazyLoading();
    //Transition file explorer elements to freeform mode
    scroll_box = document.querySelector("#organize-dataset-tab");
    $(".shared-folder-structure-element").appendTo($("#free-form-folder-structure-container"));
    freeFormItemsContainer.classList.add("freeform-file-explorer"); //add styling for free form mode
    freeFormButtons.classList.add("freeform-file-explorer-buttons");
    organizeDSglobalPath = document.getElementById("input-global-path");
    dataset_path = document.getElementById("input-global-path");
    document.getElementById("nextBtn").disabled = boolNextButtonDisabled;
  }

  if (sectionId === "guided_mode-section") {
    // Disallow the transition if an upload is in progress
    if (document.getElementById("returnButton") !== null) {
      Swal.fire({
        icon: "warning",
        text: "You cannot curate another dataset while an upload is in progress but you can still modify dataset components.",
        heightAuto: false,
        backdrop: "rgba(0,0,0, 0.4)",
        confirmButtonText: "OK",
        showClass: {
          popup: "animate__animated animate__zoomIn animate__faster",
        },
        hideClass: {
          popup: "animate__animated animate__zoomOut animate__faster",
        },
      });
      document.getElementById("main_tabs_view").click();
      document.getElementById("organize_dataset_btn").click();
    }

    // In Free Form Mode -> Organize dataset, the sodaJSONObj has
    // keys if the user has started the first step. The user must
    // be warned because Guided Mode uses shared variables and FF progress
    // must be wiped out.
    //Update: Swal will only pop up if user is on organize datasets page only
    // Update 2: If user has not selected any of the radio buttons in step 1, then swal
    // will not pop up
    let boolRadioButtonsSelected = false;
    let organizeDatasetRadioButtons = Array.from(
      document.querySelectorAll(".getting-started-1st-question")
    );

    // Remove first two as they are not radio buttons
    organizeDatasetRadioButtons = organizeDatasetRadioButtons.splice(2);

    organizeDatasetRadioButtons.forEach((radioButton) => {
      if (radioButton.classList.contains("checked")) {
        boolRadioButtonsSelected = true;
      }
    });

    if (sodaJSONObj != undefined && boolRadioButtonsSelected === true) {
      //get the element with data-next="Question-getting-started-BF-account"
      const buttonContinueExistingPennsieve = document.querySelector(
        '[data-next="Question-getting-started-BF-account"]'
      );
      const transitionWarningMessage = `
          Going back home will wipe out the progress you have made organizing your dataset.
          <br><br>
          ${
            buttonContinueExistingPennsieve.classList.contains("checked")
              ? `To continue making modifications to your existing Pennsieve dataset, press Cancel.`
              : `To save your progress, press Cancel${
                  currentTab < 2 ? ", progress to the third step," : ""
                } and press "Save Progress" in the Organize Dataset tab.`
          }
        `;

      const warnBeforeExitCurate = await Swal.fire({
        icon: "warning",
        html: transitionWarningMessage,
        showCancelButton: true,
        focusCancel: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Go back Home",
        reverseButtons: window.reverseSwalButtons,
        heightAuto: false,
        backdrop: "rgba(0,0,0, 0.4)",
        showClass: {
          popup: "animate__animated animate__zoomIn animate__faster",
        },
        hideClass: {
          popup: "animate__animated animate__zoomOut animate__faster",
        },
      });
      if (warnBeforeExitCurate.isConfirmed) {
        // Wipe out organize dataset progress before entering Guided Mode
        $("#dataset-loaded-message").hide();
        $(".vertical-progress-bar-step").removeClass("is-current");
        $(".vertical-progress-bar-step").removeClass("done");
        $(".getting-started").removeClass("prev");
        $(".getting-started").removeClass("show");
        $(".getting-started").removeClass("test2");
        $("#Question-getting-started-1").addClass("show");
        $("#generate-dataset-progress-tab").css("display", "none");
        currentTab = 0;
        wipeOutCurateProgress();
        globalGettingStarted1stQuestionBool = false;
        document.getElementById("nextBtn").disabled = true;
      } else {
        //Stay in Organize datasets section
        document.getElementById("main_tabs_view").click();
        document.getElementById("organize_dataset_btn").click();
        return;
      }
    }

    if (sectionRenderFileExplorer != "file-explorer") {
      sodaJSONObj = {};
      datasetStructureJSONObj = {};
      subjectsTableData = [];
      samplesTableData = [];
    }

    //Transition file explorer elements to guided mode
    organizeDSglobalPath = document.getElementById("guided-input-global-path");
    organizeDSglobalPath.value = "";
    dataset_path = document.getElementById("guided-input-global-path");
    scroll_box = document.querySelector("#guided-body");
    itemsContainer.innerHTML = "";
    resetLazyLoading();
    freeFormItemsContainer.classList.remove("freeform-file-explorer"); //add styling for free form mode
    freeFormButtons.classList.remove("freeform-file-explorer-buttons");
    $(".shared-folder-structure-element").appendTo($("#guided-folder-structure-container"));

    guidedUnLockSideBar();
  }

  if (sectionId === "create_new_bf_dataset-section") {
    $("#dataset-success-container").addClass("hidden");
    $("dataset-created-success-lottie").empty();
  }

  hideAllSectionsAndDeselectButtons();
  if (event.detail.target) {
    let previous_section = `${event.detail.target.dataset.section}-section`;
    document.getElementById(previous_section).classList.add("is-shown");
    forceActionSidebar("show");
    return;
  }

  document.getElementById(sectionId).classList.add("is-shown");

  let showSidebarSections = [
    "main_tabs-section", //Free form mode
    "getting_started-section", //Overview page
    "guided_mode-section", //Guided Mode
    "documentation-section", //Documentation
    "contact-us-section", //Contact us
  ];

  if (showSidebarSections.includes(sectionId)) {
    forceActionSidebar("show");
  } else {
    forceActionSidebar("hide");
  }

  boolNextButtonDisabled = document.getElementById("nextBtn").disabled;

  if (sectionId === "validate_dataset-section") {
    localDatasetButton = document.getElementById("validate_dataset-1-local");
    pennsieveDatasetButton = document.getElementById("validate_dataset-1-pennsieve");

    if (
      !localDatasetButton.classList.contains("checked") &&
      !localDatasetButton.classList.contains("non-selected") &&
      !pennsieveDatasetButton.classList.contains("checked") &&
      !pennsieveDatasetButton.classList.contains("non-selected")
    ) {
      $("#validate_dataset-question-2").removeClass("show");
      $("#validate_dataset-question-1").removeClass("prev");
      $("#validate_dataset-question-2").removeClass("prev");
      $("#validate_dataset-question-3").removeClass("show");
    }
  }
};

function showMainContent() {
  document.querySelector(".js-nav").classList.add("is-shown");
  document.querySelector(".js-content").classList.add("is-shown");
}

function handleModalTrigger(event) {
  hideAllModals();
  const modalId = `${event.target.dataset.modal}-modal`;
  document.getElementById(modalId).classList.add("is-shown");
}

function hideAllModals() {
  const modals = document.querySelectorAll(".modal.is-shown");
  Array.prototype.forEach.call(modals, (modal) => {
    modal.classList.remove("is-shown");
  });
  showMainContent();
}

function hideAllSectionsAndDeselectButtons() {
  const sections = document.querySelectorAll(".js-section.is-shown");
  Array.prototype.forEach.call(sections, (section) => {
    section.classList.remove("is-shown");
  });

  const buttons = document.querySelectorAll(".nav-button.is-selected");
  Array.prototype.forEach.call(buttons, (button) => {
    button.classList.remove("is-selected");
  });
}

showMainContent();

// Set of functions for the footer shortcuts between sections
// only required for when switching between section where the menu needs to change
// TO DISCUSS - add these for all return buttons and pulse the button on return maybe?
// Should help if people lose their position
$("#shortcut-navigate-to-organize").on("click", () => {
  $("#prepare_dataset_tab").click();
  $("#organize_dataset_btn").click();
});

$("#shortcut-navigate-to-create_submission").on("click", () => {
  $("#prepare_metadata_tab").click();
  $("#create_submission_btn").click();
});
