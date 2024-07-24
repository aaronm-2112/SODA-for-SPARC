import useGlobalStore from "../../../stores/globalStore";
import GuidedModePage from "../../containers/GuidedModePage";
import GuidedModeSection from "../../containers/GuidedModeSection";
import SodaGreenPaper from "../../utils/ui/SodaGreenPaper";
import {
  Affix,
  Text,
  Tooltip,
  Stack,
  Flex,
  Button,
  Grid,
  Card,
  Image,
  Overlay,
  Box,
} from "@mantine/core";
import { IconCloudUpload, IconSearch } from "@tabler/icons-react";
import styles from "../../sharedComponentStyles/imageSelector.module.css";
import useFetchThumbnailsPath from "../../../hooks/useFetchThumbnailsPath";

const BioLucidaImageListSelectPage = () => {
  const guidedThumbnailsPath = useFetchThumbnailsPath();
  console.log("BioLucidaImageListSelectPage");
  // Get the required zustand store state variables
  const {
    currentGuidedModePage,
    confirmedMicroscopyImages,
    bioLucidaImages,
    addBioLucidaImage,
    removeBioLucidaImage,
  } = useGlobalStore();

  // Filter the images based on the search input
  const filteredImages = confirmedMicroscopyImages.filter((image) =>
    image.relativeDatasetStructurePaths
      .map((path) => path.toLowerCase())
      .some((path) => path.includes(bioLucidaImageSelectSearchInput.toLowerCase()))
  );

  const handleCardClick = (image) => {
    console.log("image", image);
    const imageSelectedToBeUploaded = bioLucidaImages.some(
      (bioLucidaImage) => bioLucidaImage.filePath === image.filePath
    );
    if (imageSelectedToBeUploaded) {
      console.log("Removing image", image.filePath);
      removeBioLucidaImage(image);
    } else {
      console.log("Adding image", image.filePath);
      if (bioLucidaImages.length < 50) {
        addBioLucidaImage(image);
      }
    }
  };

  return (
    <GuidedModePage
      pageHeader="BioLucida Image Selection"
      pageDescriptionArray={[
        "Select the microscopy images you would like to upload to BioLucida (Up to 50). The selected images will be uploaded to BioLucida at the end of the guided process.",
      ]}
    >
      <GuidedModeSection bordered={true}>
        <Flex align="flex-end" gap="md">
          <Button>Select random images</Button>
          <SodaGreenPaper>
            <Text>Images selected: {bioLucidaImages.length}/50</Text>
          </SodaGreenPaper>
        </Flex>
        <Grid>
          {filteredImages.length !== 0 ? (
            filteredImages.map((image) => {
              const imageSelectedToBeUploaded = bioLucidaImages.some(
                (bioLucidaImage) => bioLucidaImage.filePath === image.filePath
              );
              return (
                <Grid.Col span={3} key={image.filePath}>
                  <Card
                    className={styles.card}
                    onClick={() => handleCardClick(image)}
                    shadow="sm"
                    p="2%"
                    radius="md"
                    withBorder
                    style={{
                      opacity: imageSelectedToBeUploaded ? 1 : 0.9,
                      borderColor: imageSelectedToBeUploaded ? "green" : "transparent",
                    }}
                  >
                    <Card.Section m="0px" p="0px">
                      <Image
                        src={window.path.join(
                          guidedThumbnailsPath,
                          `${image.fileName}_thumbnail.jpg`
                        )}
                        alt={`${image.fileName}_thumbnail`}
                        className={styles.thumbnailImage}
                        fallbackSrc="https://placehold.co/128x128?text=Preview+unavailable"
                        loading="lazy"
                      />
                      {imageSelectedToBeUploaded && (
                        <Overlay className={styles.thumbnailOverlay} backgroundOpacity={0}>
                          <Box className={styles.checkBox}>
                            <IconCloudUpload size={30} color={"teal"} className={styles.check} />
                          </Box>
                        </Overlay>
                      )}
                    </Card.Section>
                    <Card.Section p="6px" h="60px" mb="-3px">
                      <Tooltip
                        multiline
                        label={
                          <Stack spacing="xs">
                            <Text>Local file path:</Text>
                            <Text>{image.filePath}</Text>
                            <Text>Path in organized dataset structure:</Text>
                            {image.relativeDatasetStructurePaths.map((path) => (
                              <Text key={path}>{path}</Text>
                            ))}
                          </Stack>
                        }
                      >
                        <Text
                          weight={500}
                          size="sm"
                          ml="xs"
                          mr="xs"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            wordBreak: "break-all",
                            textAlign: "center",
                          }}
                        >
                          {image.fileName}
                        </Text>
                      </Tooltip>
                    </Card.Section>
                  </Card>
                </Grid.Col>
              );
            })
          ) : (
            <Grid.Col span={12}>
              <Text c="dimmed" size="lg" ta="center">
                No images matching the search criteria
              </Text>
              <Text c="dimmed" ta="center">
                Modify the search input to view more images
              </Text>
            </Grid.Col>
          )}
        </Grid>
      </GuidedModeSection>

      {currentGuidedModePage === "guided-biolucida-image-selection-tab" && (
        <Affix
          position={{ top: 150, right: 20 }}
          style={{
            zIndex: 1000,
          }}
        >
          <SodaGreenPaper>
            <Text>Images selected: {bioLucidaImages.length}/50</Text>
          </SodaGreenPaper>
        </Affix>
      )}
    </GuidedModePage>
  );
};

export default BioLucidaImageListSelectPage;
