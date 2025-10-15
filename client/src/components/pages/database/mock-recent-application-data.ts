import { RowWithSubRows } from "@components/ui/table";

const mockRecentApplicationData: RowWithSubRows[] = [
  {
    rowData: ['02129', '_', '_', '_', '_', '_', 'Total Applicants: 03'],
    subRowData: [
      ['Company Name', 'Business Name', '123 Mullholland Drive', 'LX33224455', 'All Alcohol', '04/05/2064', 'Granted'],
      ['Company Name', 'Business Name', '123 Very long street name and address test', 'LX33224455', 'All Alcohol', '04/05/2064', 'Expired'],
      ['Company Name', 'Business Name', '123 Very long street name and address test', 'LX33224455', 'All Alcohol', '04/05/2064', 'Deffered']
    ]
  },
  {
    rowData: ['02130', '_', '_', '_', '_', '_', 'Total Applicants: 00'],
    subRowData: [
      ['No applicants', '-', '-', '-', '-', '-', '-']
    ]
  },
  {
    rowData: ['02131', '_', '_', '_', '_', '_', 'Total Applicants: 00'],
    subRowData: [
      ['No applicants', '-', '-', '-', '-', '-', '-']
    ]
  },
  {
    rowData: ['02132', '_', '_', '_', '_', '_', 'Total Applicants: 02'],
    subRowData: [
      ['Boston Brew Co', 'The Craft House', '45 Harbor Street', 'LX44556677', 'Beer & Wine', '03/15/2064', 'Granted'],
      ['Downtown Dine LLC', 'Urban Bistro', '890 Commonwealth Ave', 'LX55667788', 'All Alcohol', '03/20/2064', 'Granted']
    ]
  },
  {
    rowData: ['02133', '_', '_', '_', '_', '_', 'Total Applicants: 01'],
    subRowData: [
      ['Waterfront Ventures', 'Seaport Grill', '22 Atlantic Avenue', 'LX66778899', 'All Alcohol', '02/28/2064', 'Pending']
    ]
  },
  {
    rowData: ['02134', '_', '_', '_', '_', '_', 'Total Applicants: 00'],
    subRowData: [
      ['No applicants', '-', '-', '-', '-', '-', '-']
    ]
  },
  {
    rowData: ['02108', '_', '_', '_', '_', '_', 'Total Applicants: 04'],
    subRowData: [
      ['Historic Tavern Group', 'Beacon Hill Pub', '15 Charles Street', 'LX77889900', 'All Alcohol', '04/10/2064', 'Granted'],
      ['Cambridge Street LLC', 'The Corner Bar', '78 Cambridge Street', 'LX88990011', 'Beer & Wine', '04/12/2064', 'Granted'],
      ['State House Dining', 'Political Plate', '33 Beacon Street', 'LX99001122', 'All Alcohol', '03/25/2064', 'Expired'],
      ['MGH Hospitality', 'Doctor\'s Orders', '55 Fruit Street', 'LX00112233', 'Beer & Wine', '04/01/2064', 'Deffered']
    ]
  },
  {
    rowData: ['02109', '_', '_', '_', '_', '_', 'Total Applicants: 02'],
    subRowData: [
      ['North End Foods', 'Italian Kitchen', '120 Hanover Street', 'LX11223344', 'All Alcohol', '03/18/2064', 'Granted'],
      ['Pastry Palace Inc', 'Cafe Dolce', '88 Salem Street', 'LX22334455', 'Beer & Wine', '04/05/2064', 'Pending']
    ]
  },
  {
    rowData: ['02110', '_', '_', '_', '_', '_', 'Total Applicants: 01'],
    subRowData: [
      ['Financial District Eats', 'Wall Street Tavern', '200 State Street', 'LX33445566', 'All Alcohol', '02/15/2064', 'Granted']
    ]
  },
  {
    rowData: ['02116', '_', '_', '_', '_', '_', 'Total Applicants: 05'],
    subRowData: [
      ['Back Bay Ventures', 'Newbury Street Wine Bar', '250 Newbury Street', 'LX44556688', 'Beer & Wine', '04/08/2064', 'Granted'],
      ['Boylston Dining Group', 'The Prudential Grill', '800 Boylston Street', 'LX55667799', 'All Alcohol', '03/30/2064', 'Granted'],
      ['Copley Square Resto', 'The Library Lounge', '138 St James Avenue', 'LX66778800', 'All Alcohol', '04/15/2064', 'Pending'],
      ['Symphony Hall Catering', 'Music & Merlot', '301 Massachusetts Avenue', 'LX77889911', 'Beer & Wine', '03/22/2064', 'Expired'],
      ['Christian Science Plaza', 'Reflections Restaurant', '175 Huntington Avenue', 'LX88990022', 'All Alcohol', '04/02/2064', 'Deffered']
    ]
  },
  {
    rowData: ['02113', '_', '_', '_', '_', '_', 'Total Applicants: 01'],
    subRowData: [
      ['Little Italy Group', 'North End Tavern', '95 Hanover Street', 'LX11334455', 'All Alcohol', '03/28/2064', 'Granted']
    ]
  },
  {
    rowData: ['02115', '_', '_', '_', '_', '_', 'Total Applicants: 03'],
    subRowData: [
      ['Fenway Sports Dining', 'Green Monster Grill', '4 Yawkey Way', 'LX22445566', 'All Alcohol', '04/12/2064', 'Granted'],
      ['Symphony Sounds Cafe', 'Berklee Bistro', '150 Massachusetts Ave', 'LX33556677', 'Beer & Wine', '03/31/2064', 'Pending'],
      ['Back Bay Station Food', 'Platform Pub', '145 Dartmouth Street', 'LX44667788', 'Beer & Wine', '04/03/2064', 'Deffered']
    ]
  },
  {
    rowData: ['02118', '_', '_', '_', '_', '_', 'Total Applicants: 02'],
    subRowData: [
      ['South End Ventures', 'Washington Street Wine', '789 Washington Street', 'LX55778899', 'Beer & Wine', '03/25/2064', 'Granted'],
      ['Harrison Ave Hospitality', 'The South End Social', '456 Harrison Avenue', 'LX66889900', 'All Alcohol', '04/08/2064', 'Pending']
    ]
  },
  {
    rowData: ['02119', '_', '_', '_', '_', '_', 'Total Applicants: 01'],
    subRowData: [
      ['Roxbury Community Kitchen', 'Dudley Square Diner', '2201 Washington Street', 'LX77990011', 'Beer & Wine', '03/20/2064', 'Granted']
    ]
  },
  {
    rowData: ['02120', '_', '_', '_', '_', '_', 'Total Applicants: 00'],
    subRowData: [
      ['No applicants', '-', '-', '-', '-', '-', '-']
    ]
  }
]

export default mockRecentApplicationData;
