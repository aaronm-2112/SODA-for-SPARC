import useGlobalStore from "../globalStore";
import { produce } from "immer";

const initialState = {
  backgroundServicesChecksInProgress: true,
  backgroundServicesChecksSuccessful: false,
  internetConnectionCheckSuccessful: false,
  pennsieveAgentInstalled: false,
  pennsieveAgentDownloadURL: null,
  pennsieveAgentUpToDate: true,
  pennsieveAgentOutputErrorMessage: null,
};

export const backgroundServicesSlice = (set) => ({
  ...initialState,
});

export const setBackgroundServicesChecksInProgress = (inProgress) => {
  useGlobalStore.setState(
    produce((state) => {
      state.backgroundServicesChecksInProgress = inProgress;
    })
  );
};

export const setBackgroundServicesChecksSuccessful = (successful) => {
  useGlobalStore.setState(
    produce((state) => {
      state.backgroundServicesChecksInProgress = false;
      state.backgroundServicesChecksSuccessful = successful;
    })
  );
};

export const resetBackgroundServicesState = () => {
  useGlobalStore.setState(
    produce((state) => {
      Object.assign(state, initialState);
    })
  );
};

export const setInternetConnectionCheckSuccessful = (connectionStatus) => {
  useGlobalStore.setState(
    produce((state) => {
      state.internetConnectionCheckSuccessful = connectionStatus;
    })
  );
};

export const setPennsieveAgentInstalled = (installed) => {
  useGlobalStore.setState(
    produce((state) => {
      state.pennsieveAgentInstalled = installed;
    })
  );
};

export const setPennsieveAgentDownloadURL = (downloadURL) => {
  useGlobalStore.setState(
    produce((state) => {
      state.pennsieveAgentDownloadURL = downloadURL;
    })
  );
};

export const setPennsieveAgentUpToDate = (upToDate) => {
  useGlobalStore.setState(
    produce((state) => {
      state.pennsieveAgentUpToDate = upToDate;
    })
  );
};

export const setPennsieveAgentOutputErrorMessage = (errorMessage) => {
  useGlobalStore.setState(
    produce((state) => {
      state.pennsieveAgentOutputErrorMessage = errorMessage;
    })
  );
};
