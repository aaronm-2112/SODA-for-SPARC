import useGlobalStore from "../globalStore";
import { produce } from "immer";

export const microscopyImageMetadataSlice = (set) => ({
  selectedImageFileName: "sub-a-img-1.tif",
  setSelectedImageFileName: (selectedImageFileName) => {
    set((state) => {
      state.selectedImageFileName = selectedImageFileName;
    });
  },

  magnification: "",
  setMagnification: (magnification) => {
    set((state) => {
      state.magnification = magnification;
    });
  },

  channelName: "",
  setChannelName: (channelName) => {
    set((state) => {
      state.channelName = channelName;
    });
  },

  channelColor: "",
  setChannelColor: (channelColor) => {
    set((state) => {
      state.channelColor = channelColor;
    });
  },

  spacingX: "",
  setSpacingX: (spacingX) => {
    set((state) => {
      state.spacingX = spacingX;
    });
  },

  spacingY: "",
  setSpacingY: (spacingY) => {
    set((state) => {
      state.spacingY = spacingY;
    });
  },

  copyImageMetadataModeActive: false,
  setCopyImageMetadataModeActive: (copyImageMetadataModeActive) => {
    set((state) => {
      state.copyImageMetadataModeActive = copyImageMetadataModeActive;
    });
  },

  imageMetadataSearchValue: "",
  setImageMetadataSearchValue: (imageMetadataSearchValue) => {
    set((state) => {
      state.imageMetadataSearchValue = imageMetadataSearchValue;
    });
  },

  imageMetadataStore: {},
  setImageMetadata: (imageFileName, imageMetadataKey, imageMetadataValue) => {
    set(
      produce((state) => {
        state.imageMetadataStore[imageFileName][imageMetadataKey] = imageMetadataValue;
      })
    );
  },

  imageHasRequiredMetadata: (fileName) => {
    const state = useGlobalStore.getState();
    const imageMetadata = state.imageMetadataStore[fileName];
    if (!imageMetadata) {
      return false;
    }
    for (let field of state.imageMetadataFields) {
      if (!imageMetadata[field.key]) {
        return false;
      }
    }
    return true;
  },

  copyImageMetadata: (copyFromImageFileName, copyToImageFileNamesArray) => {
    const state = useGlobalStore.getState();
    const imageMetadata = state.imageMetadataStore[copyFromImageFileName];
    if (!imageMetadata) {
      return;
    }
    set(
      produce((state) => {
        for (let copyToImageFileName of copyToImageFileNamesArray) {
          state.imageMetadataStore[copyToImageFileName] = { ...imageMetadata };
        }
      })
    );
  },

  imageMetadataFields: [
    {
      key: "channelName",
      label: "Channel Name",
    },
    {
      key: "channelColor",
      label: "Channel Color",
    },
    {
      key: "magnification",
      label: "Magnification",
    },
    {
      key: "spacingX",
      label: "Spacing X",
    },
    {
      key: "spacingY",
      label: "Spacing Y",
    },
    {
      key: "spacingZ",
      label: "Spacing Z",
    },
  ],

  setImageMetadataJson: (imageMetadataJson) => {
    set(
      produce((state) => {
        const imageMetadataFieldKeys = state.imageMetadataFields.map((field) => field.key);
        const confirmedImages = state.confirmedMicroscopyImages.map((image) => image.fileName);
        for (const fileName of confirmedImages) {
          if (!imageMetadataJson[fileName]) {
            imageMetadataJson[fileName] = {};
          }
          for (const fieldKey of imageMetadataFieldKeys) {
            if (imageMetadataJson[fileName][fieldKey] === undefined) {
              imageMetadataJson[fileName][fieldKey] =
                Math.floor(Math.random() * 5) + 1 > 3 ? "" : Math.floor(Math.random() * 5) + 1;
            }
          }
        }
        state.imageMetadataStore = imageMetadataJson;
      })
    );
  },

  imageMetadataCopyFilterValue: "",
  setImageMetadataCopyFilterValue: (imageMetadataCopyFilterValue) => {
    set((state) => {
      state.imageMetadataCopyFilterValue = imageMetadataCopyFilterValue;
    });
  },
});
