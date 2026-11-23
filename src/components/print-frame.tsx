/**
 * Gives every printed page a top and bottom margin while the page margin
 * itself is zero. A zero page margin is what stops browsers from printing
 * their own header and footer (date, title, address, page number).
 */
export function PrintFrame({ children }: { children: React.ReactNode }) {
  return (
    <table className="w-full border-collapse">
      <thead className="hidden print:table-header-group">
        <tr>
          <td className="h-[14mm] p-0" />
        </tr>
      </thead>
      <tfoot className="hidden print:table-footer-group">
        <tr>
          <td className="h-[14mm] p-0" />
        </tr>
      </tfoot>
      <tbody>
        <tr>
          <td className="p-0 align-top">{children}</td>
        </tr>
      </tbody>
    </table>
  );
}