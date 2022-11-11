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
  "https://github.com/terra-rebels/station-desktop/releases/download"

export const links = [
  {
    title: "Windows",
    list: [
      {
        label: "Installer",
        link: `${DOWNLOAD}/v1.0.0/Rebel.Station.Setup.1.0.0.exe`,
      },
    ],
  },
  {
    title: "Mac",
    list: [
      {
        label: "Apple silicon",
        link: `${DOWNLOAD}/v1.0.0/Rebel.Station-1.0.0-arm64.dmg`,
      },
      {
        label: "Intel chip",
        link: `${DOWNLOAD}/v1.0.0/Rebel.Station-1.0.0.dmg`,
      },
    ],
  },
  {
    title: "Linux",
    list: [
      {
        label: "Debian",
        link: `${DOWNLOAD}/v1.0.0/Rebel.Station_1.0.0_amd64.deb`,
      },
      {
        label: "Red hat",
        link: `${DOWNLOAD}/v1.0.0/Rebel.Station-1.0.0.x86_64.rpm`,
      },
    ],
  },
]
