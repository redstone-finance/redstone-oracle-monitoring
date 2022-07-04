import ReactJson from "react-json-view";
import Card from "../components/Card";

interface Props {
  json: Record<string, any>;
  title: string;
}

const JsonViewer = ({ json, title }: Props) => {
  return (
    <Card>
      <p className="text-lg font-bold">{title}</p>
      <ReactJson
        src={json}
        indentWidth={2}
        enableClipboard={false}
        displayObjectSize={false}
        displayDataTypes={false}
        iconStyle="square"
        collapsed={1}
        name={false}
      />
    </Card>
  );
};

export default JsonViewer;
