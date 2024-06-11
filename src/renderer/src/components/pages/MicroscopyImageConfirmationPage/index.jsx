import useGlobalStore from "../../../stores/globalStore";
import {
  designateImageAsMicroscopyImage,
  undesignateImageAsMicroscopyImage,
  setConfirmedMicroscopyImages,
} from "../../../stores/slices/microscopyImageSlice";
import { Table, Checkbox, Text, Tooltip, Button, Stack } from "@mantine/core";
import GuidedModePage from "../../containers/GuidedModePage";
import styles from "./MicroscopyImageConfirmationPage.module.css";
import GuidedModeSection from "../../containers/GuidedModeSection";
import ExternalLink from "../../buttons/ExternalLink";
import DropDownNote from "../../utils/ui/DropDownNote";

const MicroscopyImageConfirmationPage = () => {
  // Get the required zustand store state variables
  const { potentialMicroscopyImages, confirmedMicroscopyImages } = useGlobalStore();

  const confirmedMicroscopyImagePathPaths = confirmedMicroscopyImages.map(
    (imageObj) => imageObj["filePath"]
  );
  const allImagesSelected = potentialMicroscopyImages.length === confirmedMicroscopyImages.length;

  const toggleAllImages = (markAllImagesAsMicroscopy) => {
    if (markAllImagesAsMicroscopy) {
      setConfirmedMicroscopyImages(potentialMicroscopyImages);
    } else {
      setConfirmedMicroscopyImages([]);
    }
  };

  const tableRows = potentialMicroscopyImages.map((imageObj) => {
    const filePath = imageObj["filePath"];
    const fileName = imageObj["fileName"];
    const relativeDatasetStructurePath = imageObj["relativeDatasetStructurePath"];
    console.log("relativeDatasetStructurePath", relativeDatasetStructurePath);

    // Check if the image is already confirmed as a microscopy image
    const isImageDesignatedAsMicroscopyImage = confirmedMicroscopyImagePathPaths.includes(filePath);

    return (
      <Table.Tr key={relativeDatasetStructurePath}>
        <Table.Td className={styles.selectCell}>
          {isImageDesignatedAsMicroscopyImage ? (
            <Checkbox
              aria-label={`Deselect ${imageObj.fileName}`}
              checked={true}
              onChange={() => undesignateImageAsMicroscopyImage(imageObj)}
            />
          ) : (
            <Checkbox
              aria-label={`Select ${imageObj.fileName}`}
              checked={false}
              onChange={() => designateImageAsMicroscopyImage(imageObj)}
            />
          )}
        </Table.Td>
        <Table.Td>
          <Tooltip
            multiline
            label={
              <Stack gap="xs">
                <Text ta="left">Local file path:</Text>
                <Text ta="left">{filePath}</Text>
                <Text ta="left">Path in organized dataset structure:</Text>
                <Text>{relativeDatasetStructurePath}</Text>
              </Stack>
            }
          >
            <Text ta="left">{fileName}</Text>
          </Tooltip>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <GuidedModePage
      pageHeader="Microscopy Image Confirmation"
      pageDescriptionArray={[
        "SODA has identified the images below as potential microscopy images. Please check the boxes next to the images that are microscopy images. You can use the button below to select or deselect all images at once.",
        "The selected images will be converted with MicroFile+ and processed to ensure they are SDS compliant.",
      ]}
    >
      <Table withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th className={styles.selectHeader}>
              {allImagesSelected ? (
                <Button className={styles.toggleButton} onClick={() => toggleAllImages(false)}>
                  Deselect all
                </Button>
              ) : (
                <Button className={styles.toggleButton} onClick={() => toggleAllImages(true)}>
                  Select all
                </Button>
              )}
            </Table.Th>

            <Table.Th>Image name</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{tableRows}</Table.Tbody>
      </Table>
    </GuidedModePage>
  );
};

export default MicroscopyImageConfirmationPage;
