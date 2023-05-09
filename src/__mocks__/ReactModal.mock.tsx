import * as React from "react"

interface IProps {
  id: string
  isOpen: boolean
  children: React.ReactNode
}

export default class MockReactModal extends React.Component<IProps, any> {
  static setAppElement() {
    return {}
  }

  render() {
    return (
      <div id={this.props.id}>{this.props.isOpen && this.props.children}</div>
    )
  }
}
