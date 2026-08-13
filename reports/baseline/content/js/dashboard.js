/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [1.0, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [1.0, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [1.0, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [1.0, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [1.0, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [1.0, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [1.0, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [1.0, 500, 1500, "GET / (login)"], "isController": false}, {"data": [1.0, 500, 1500, "04 Cart"], "isController": true}, {"data": [1.0, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [1.0, 500, 1500, "01 Login"], "isController": true}, {"data": [1.0, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [1.0, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [1.0, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [1.0, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [1.0, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [1.0, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [1.0, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1250, 0, 0.0, 8.05120000000002, 2, 134, 6.0, 14.900000000000091, 18.0, 33.49000000000001, 128.60082304526748, 28758.86140046296, 26.162229938271604], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 50, 0, 0.0, 3.0600000000000005, 2, 12, 3.0, 4.899999999999999, 8.349999999999987, 12.0, 5.347593582887701, 8.460060160427808, 0.684115975935829], "isController": false}, {"data": ["GET /inventory-item.html-3", 50, 0, 0.0, 4.8, 3, 13, 4.0, 7.899999999999999, 9.899999999999991, 13.0, 5.352745958676801, 148.59620055400922, 0.716138863612033], "isController": false}, {"data": ["05 Checkout Step One", 50, 0, 0.0, 14.239999999999998, 9, 32, 12.5, 22.699999999999996, 30.349999999999987, 32.0, 5.37345513164965, 3004.149734685653, 2.7811828318108547], "isController": true}, {"data": ["GET /inventory-item.html-1", 50, 0, 0.0, 4.72, 2, 12, 4.0, 7.0, 11.0, 12.0, 5.353319057815845, 80.11681109475374, 0.6430256290149893], "isController": false}, {"data": ["GET /inventory-item.html-2", 50, 0, 0.0, 10.680000000000001, 6, 30, 9.5, 15.899999999999999, 20.89999999999999, 30.0, 5.3516001284384025, 2754.809332521674, 0.7107593920582254], "isController": false}, {"data": ["GET / (login)-0", 50, 0, 0.0, 4.519999999999999, 2, 44, 4.0, 5.0, 6.0, 44.0, 5.17437648763324, 8.186025302701024, 0.5659474283348856], "isController": false}, {"data": ["GET / (login)-1", 50, 0, 0.0, 6.16, 3, 28, 5.0, 8.899999999999999, 12.899999999999991, 28.0, 5.226298735235706, 78.21584777098359, 0.6277683051113202], "isController": false}, {"data": ["GET / (login)-2", 50, 0, 0.0, 11.980000000000002, 7, 33, 10.0, 20.499999999999993, 29.799999999999983, 33.0, 5.223568742164647, 2688.903426008149, 0.6937552235687422], "isController": false}, {"data": ["03 Inventory Item (product details)", 50, 0, 0.0, 14.579999999999998, 9, 41, 13.0, 19.9, 32.89999999999999, 41.0, 5.343593031954686, 2987.4546629528695, 2.750071804531367], "isController": true}, {"data": ["GET / (login)-3", 50, 0, 0.0, 6.0600000000000005, 3, 14, 5.0, 8.899999999999999, 12.449999999999996, 14.0, 5.2246603970741905, 145.04045030041797, 0.6990024164054336], "isController": false}, {"data": ["GET / (login)", 50, 0, 0.0, 19.040000000000003, 11, 134, 15.0, 25.699999999999996, 49.84999999999986, 134.0, 5.169027189083015, 2889.859741677866, 2.5643220820841517], "isController": false}, {"data": ["04 Cart", 50, 0, 0.0, 13.659999999999997, 9, 37, 12.0, 16.9, 33.89999999999999, 37.0, 5.357334190506804, 2995.136963596914, 2.7048259536054857], "isController": true}, {"data": ["GET /inventory-item.html", 50, 0, 0.0, 14.579999999999998, 9, 41, 13.0, 19.9, 32.89999999999999, 41.0, 5.343593031954686, 2987.4546629528695, 2.750071804531367], "isController": false}, {"data": ["GET /inventory.html", 50, 0, 0.0, 15.379999999999995, 10, 48, 14.0, 23.39999999999999, 35.79999999999998, 48.0, 5.328786102525845, 2979.1765193701376, 2.7164319780454016], "isController": false}, {"data": ["GET /inventory.html-3", 50, 0, 0.0, 6.000000000000001, 3, 23, 5.0, 9.899999999999999, 16.799999999999983, 23.0, 5.33731853116994, 148.1679237163749, 0.7140748425491033], "isController": false}, {"data": ["GET /inventory.html-0", 50, 0, 0.0, 3.3399999999999994, 2, 7, 3.0, 4.899999999999999, 5.8999999999999915, 7.0, 5.335609860207022, 8.441101536655639, 0.6565301195176608], "isController": false}, {"data": ["01 Login", 50, 0, 0.0, 19.040000000000003, 11, 134, 15.0, 25.699999999999996, 49.84999999999986, 134.0, 5.101520253035404, 2852.118485996327, 2.5308323130292827], "isController": true}, {"data": ["GET /inventory.html-2", 50, 0, 0.0, 11.260000000000002, 6, 41, 9.0, 17.599999999999994, 28.14999999999997, 41.0, 5.332195798229711, 2744.8206882531726, 0.7081822544523835], "isController": false}, {"data": ["GET /inventory.html-1", 50, 0, 0.0, 5.680000000000001, 3, 20, 5.0, 8.899999999999999, 15.449999999999996, 20.0, 5.333902282910177, 79.82622313046724, 0.6406933406229998], "isController": false}, {"data": ["GET /checkout-step-one.html", 50, 0, 0.0, 14.239999999999998, 9, 32, 12.5, 22.699999999999996, 30.349999999999987, 32.0, 5.37345513164965, 3004.149734685653, 2.7811828318108547], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 50, 0, 0.0, 5.059999999999999, 3, 17, 4.0, 7.899999999999999, 10.0, 17.0, 5.382131324004306, 149.41196010495156, 0.7200703040904198], "isController": false}, {"data": ["GET /cart.html-3", 50, 0, 0.0, 4.800000000000001, 2, 14, 4.0, 7.899999999999999, 11.349999999999987, 14.0, 5.365382551775942, 148.94700175716278, 0.7178295015559609], "isController": false}, {"data": ["02 Inventory (product search)", 50, 0, 0.0, 15.379999999999995, 10, 48, 14.0, 23.39999999999999, 35.79999999999998, 48.0, 5.328786102525845, 2979.1765193701376, 2.7164319780454016], "isController": true}, {"data": ["GET /cart.html-2", 50, 0, 0.0, 9.62, 6, 28, 8.0, 12.0, 26.449999999999996, 28.0, 5.363655867839519, 2761.0151892029608, 0.7123605449474363], "isController": false}, {"data": ["GET /cart.html-1", 50, 0, 0.0, 4.9399999999999995, 2, 21, 4.0, 7.899999999999999, 11.899999999999991, 21.0, 5.365382551775942, 80.29735117770146, 0.6444746619808992], "isController": false}, {"data": ["GET /cart.html-0", 50, 0, 0.0, 3.160000000000001, 2, 10, 3.0, 4.899999999999999, 6.0, 10.0, 5.360780529645116, 8.480922322290125, 0.6334516055537687], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 50, 0, 0.0, 3.1199999999999997, 2, 8, 3.0, 5.0, 6.449999999999996, 8.0, 5.378078950198988, 8.508288964181993, 0.7037720501236958], "isController": false}, {"data": ["GET /cart.html", 50, 0, 0.0, 13.659999999999997, 9, 37, 12.0, 16.9, 33.89999999999999, 37.0, 5.357334190506804, 2995.136963596914, 2.7048259536054857], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 50, 0, 0.0, 10.440000000000003, 6, 24, 9.0, 17.0, 22.89999999999999, 24.0, 5.3792361484669176, 2769.035351667563, 0.7144298009682625], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 50, 0, 0.0, 4.980000000000001, 2, 18, 4.0, 7.899999999999999, 13.799999999999983, 18.0, 5.382131324004306, 80.54801029332616, 0.6464864773950485], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1250, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
