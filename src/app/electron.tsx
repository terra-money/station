declare global {
  interface Window {
    require: NodeRequire
    electron: any
  }
}

const getElectron = () => {
  try {
    if (window.electron) {
      return window.electron.sendSync
    } else {
      const { ipcRenderer } = window.require("electron")
      return ipcRenderer.sendSync
    }
  } catch {
    return
  }
}

const electron = getElectron()

export default electron

/* Download links */
const DOWNLOAD =
  "https://github.com/terra-money/station-desktop/releases/download"

export const links = [
  {
    title: "Windows",
    list: [
      {
        label: "Installer",
        link: `${DOWNLOAD}/v1.2.0/Terra.Station.Setup.1.2.0.exe`,
      },
    ],
  },
  {
    title: "Mac",
    list: [
      {
        label: "Apple silicon",
        link: `${DOWNLOAD}/v1.2.0/Terra.Station-1.2.0-arm64.dmg`,
      },
      {
        label: "Intel chip",
        link: `${DOWNLOAD}/v1.2.0/Terra.Station-1.2.0.dmg`,
      },
    ],
  },
  {
    title: "Linux",
    list: [
      {
        label: "Debian",
        link: `${DOWNLOAD}/v1.2.0/Terra.Station_1.2.0_amd64.deb`,
      },
      {
        label: "Red hat",
        link: `${DOWNLOAD}/v1.2.0/Terra.Station-1.2.0.x86_64.rpm`,
      },
    ],
  },
]
