type ReadingTimeNoteProps = {
  value: string;
};

export function ReadingTimeNote({ value }: ReadingTimeNoteProps) {
  return <div className="reading-time-note">{value}</div>;
}
