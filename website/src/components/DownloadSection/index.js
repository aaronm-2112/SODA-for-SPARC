import React, { useLayoutEffect, useRef, useState } from 'react'
import { DownloadContainer, DownloadWrapper, Column, Heading, TopLine, SecondLine, Install, Icon } from './DownloadElements'
import { AiOutlineCloudDownload } from 'react-icons/ai'
import { FaWindows, FaApple, FaLinux } from 'react-icons/fa'

const DownloadSection = () => {

    const [show, doShow] = useState({
        itemOne: false,
        itemTwo: false
      });
      const refOne = useRef(null);
      const refTwo = useRef(null);

  useLayoutEffect(() => {
    const topPosition1 = refOne.current.getBoundingClientRect().top;
    const topPosition2 = refTwo.current.getBoundingClientRect().top;
    const onScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
     if(topPosition1 < scrollPosition) { 
        doShow(state => ({ ...state, itemOne: true }));
       }
     if (topPosition2 < scrollPosition) {
        doShow(state => ({ ...state, itemTwo: true }));
     }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

    return (
        <div>
            <DownloadContainer id='downloads'>
            <Heading animate={show.itemOne} ref={refOne}>Download SODA</Heading>
                <DownloadWrapper animate={show.itemTwo} ref={refTwo}>
                        <Column>
                            <TopLine>Windows
                                <Icon>
                                    <FaWindows />
                                </Icon>
                            </TopLine>
                            <Install href="https://github.com/bvhpatel/SODA" target="_blank">Windows Installer
                                <Icon>
                                    <AiOutlineCloudDownload />
                                </Icon>
                            </Install>
                        </Column>
                        <Column>
                            <TopLine>MacOS
                                <Icon>
                                    <FaApple />
                                </Icon>
                            </TopLine>
                            <Install href="https://github.com/bvhpatel/SODA" target="_blank">MacOS Installer
                                <Icon>
                                    <AiOutlineCloudDownload />
                                </Icon>
                            </Install>
                        </Column>
                        <Column>
                            <TopLine>Linux
                                <Icon>
                                    <FaLinux />
                                </Icon>
                            </TopLine>
                            <Install href="https://github.com/bvhpatel/SODA" target="_blank">Linux Installer
                                <Icon>
                                    <AiOutlineCloudDownload />
                                </Icon>
                            </Install>
                        </Column>
                </DownloadWrapper>
            </DownloadContainer>
        </div>
    )
}

export default DownloadSection
