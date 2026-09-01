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

    var data = {"OkPercent": 79.46540836076458, "KoPercent": 20.53459163923541};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6045913497231826, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9579939991427346, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [0.901843120445778, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [0.3180261186041533, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.904414916416631, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [0.7781825975139306, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [0.9625413907284768, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.9155629139072847, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.7949089403973509, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.31343915343915346, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.9105960264900662, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.33497588592996436, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.3165176670923797, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.3108654050605996, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.3230069782194967, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.9070404721753794, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [0.9656408094435076, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [0.3378491037932472, 500, 1500, "01 Login"], "isController": true}, {"data": [0.7786677908937606, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [0.9125210792580101, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [0.31552354332401633, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.901245169600687, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [0.8976784178847808, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [0.3267170762444864, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.7725709372312983, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [0.9045571797076526, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [0.9598022355975925, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [0.9645770717045943, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [0.3147316655976053, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [0.7760841562902533, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [0.9006011163589523, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 70783, 14535, 20.53459163923541, 274.2404673438497, 0, 3305, 61.0, 340.0, 468.0, 757.9900000000016, 236.91389057170878, 41759.31411385099, 43.99729629360781], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 2333, 0, 0.0, 220.87783969138408, 3, 1683, 184.0, 480.5999999999999, 558.0, 792.6599999999999, 7.898434193821413, 12.495569720694032, 1.1569971963605585], "isController": false}, {"data": ["GET /inventory-item.html-3", 2333, 145, 6.215173596228032, 224.9725675096441, 2, 1830, 192.0, 466.0, 549.0, 1037.9599999999991, 7.896669724242742, 206.78705731431998, 1.1282392254291045], "isController": false}, {"data": ["05 Checkout Step One", 4671, 2484, 53.179190751445084, 303.0520231213874, 0, 3142, 22.0, 935.8000000000002, 1084.3999999999996, 1737.1999999999962, 15.887214720587735, 4184.93979265161, 4.477220694024013], "isController": true}, {"data": ["GET /inventory-item.html-1", 2333, 137, 5.8722674667809684, 223.57351050150018, 2, 1833, 186.0, 462.0, 554.0, 1139.5799999999836, 7.897017208930771, 112.37372134665638, 1.0307873238149396], "isController": false}, {"data": ["GET /inventory-item.html-2", 2333, 133, 5.7008144020574365, 381.1521645949416, 2, 2186, 374.0, 696.0, 807.5999999999995, 1596.2599999999911, 7.894131341021061, 3833.048244862724, 1.126792717300092], "isController": false}, {"data": ["GET / (login)-0", 2416, 0, 0.0, 215.80173841059604, 2, 1787, 179.5, 459.0, 534.0, 739.2999999999993, 8.089385025932238, 12.79765990430686, 1.0348724984346906], "isController": false}, {"data": ["GET / (login)-1", 2416, 116, 4.801324503311259, 209.6870860927152, 3, 1511, 171.0, 452.0, 533.1500000000001, 752.649999999996, 8.093124528933924, 116.25051032158112, 1.068404028138347], "isController": false}, {"data": ["GET / (login)-2", 2416, 127, 5.256622516556291, 364.2781456953639, 3, 2156, 343.5, 692.0, 807.3000000000002, 1102.2799999999988, 8.090658236665147, 3946.8853354412527, 1.1602844194132265], "isController": false}, {"data": ["03 Inventory Item (product details)", 4725, 2534, 53.629629629629626, 304.1447619047633, 0, 3166, 20.0, 933.4000000000005, 1093.6999999999998, 1874.1399999999976, 15.914610117313412, 4163.974703874576, 4.421086847879905], "isController": true}, {"data": ["GET / (login)-3", 2416, 130, 5.380794701986755, 211.99172185430476, 2, 1508, 173.0, 461.3000000000002, 537.1500000000001, 734.2999999999993, 8.093151639399178, 213.64253402783362, 1.1665990422880572], "isController": false}, {"data": ["GET / (login)", 4769, 2493, 52.2751100859719, 298.6802264625703, 1, 2989, 24.0, 937.0, 1090.5, 1447.600000000004, 15.962645601820858, 4305.637683937358, 4.4275028189432994], "isController": false}, {"data": ["04 Cart", 4698, 2504, 53.299276287782035, 312.2437207322261, 0, 3305, 22.0, 956.2000000000007, 1118.0500000000002, 1891.0600000000013, 15.897885357905459, 4181.3673794344795, 4.3613508412123405], "isController": true}, {"data": ["GET /inventory-item.html", 4703, 2534, 53.88050180735701, 303.79821390601853, 1, 3166, 21.0, 932.0, 1092.8000000000002, 1844.7200000000003, 15.913028178545327, 4183.037373982385, 4.441326577007146], "isController": false}, {"data": ["GET /inventory.html", 4729, 2510, 53.07676041446395, 298.2025798266004, 1, 3162, 22.0, 930.0, 1064.5, 1600.2999999999984, 15.929155845686934, 4234.995936606321, 4.465525837510147], "isController": false}, {"data": ["GET /inventory.html-3", 2372, 139, 5.860033726812816, 219.83684654300143, 2, 1540, 190.5, 457.7000000000003, 540.3499999999999, 981.7799999999997, 7.993395002443174, 210.0389453434346, 1.1463835742809483], "isController": false}, {"data": ["GET /inventory.html-0", 2372, 0, 0.0, 209.8271500843169, 3, 1497, 173.5, 454.7000000000003, 540.0, 764.6199999999999, 7.995847013692719, 12.64967984588106, 1.132224430649848], "isController": false}, {"data": ["01 Login", 4798, 2493, 51.959149645685706, 299.6042100875359, 0, 2989, 23.0, 939.2000000000007, 1098.0500000000002, 1537.1600000000035, 15.97544083959299, 4283.044038853567, 4.4042696919034015], "isController": true}, {"data": ["GET /inventory.html-2", 2372, 135, 5.691399662731872, 374.91989881956084, 3, 2165, 368.0, 695.7000000000003, 802.3499999999999, 1379.54, 7.990029305756728, 3879.9975381164313, 1.140594867913565], "isController": false}, {"data": ["GET /inventory.html-1", 2372, 129, 5.438448566610456, 218.21037099494083, 3, 1552, 186.0, 451.0, 542.0, 971.2399999999998, 7.993502751557757, 114.18128453664139, 1.0481902252300828], "isController": false}, {"data": ["GET /checkout-step-one.html", 4651, 2484, 53.40786927542464, 303.2835949258225, 1, 3142, 22.0, 935.0, 1083.3999999999996, 1729.9199999999983, 15.905531198916606, 4207.781256839618, 4.501657431757714], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 2329, 141, 6.054100472305711, 223.45255474452577, 2, 1605, 186.0, 470.0, 572.5, 1053.399999999996, 7.967595934439241, 208.96941464340816, 1.140327957743347], "isController": false}, {"data": ["GET /cart.html-3", 2326, 140, 6.0189165950128976, 232.01547721410125, 2, 1833, 196.0, 477.3000000000002, 565.0, 1225.7600000000002, 7.913071877636556, 207.60990374654696, 1.1329485803418338], "isController": false}, {"data": ["02 Inventory (product search)", 4761, 2510, 52.72001680319261, 297.452425960931, 0, 3162, 22.0, 930.0, 1066.0, 1683.1200000000026, 15.979727461905084, 4219.886180680254, 4.449593589523058], "isController": true}, {"data": ["GET /cart.html-2", 2326, 127, 5.460017196904557, 393.01418744625937, 2, 2223, 377.5, 716.3000000000002, 856.3000000000002, 1739.8600000000015, 7.9106766927521734, 3850.8411670097403, 1.132037714516738], "isController": false}, {"data": ["GET /cart.html-1", 2326, 127, 5.460017196904557, 230.1672398968191, 3, 1830, 195.0, 477.3000000000002, 569.0, 1200.8700000000003, 7.913637245128826, 113.01907395282949, 1.037480745382294], "isController": false}, {"data": ["GET /cart.html-0", 2326, 0, 0.0, 223.9969905417021, 3, 1743, 186.0, 474.3000000000002, 550.6500000000001, 793.6500000000001, 7.91686946695575, 12.524734898894838, 1.0823844974353563], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 2329, 0, 0.0, 215.55474452554776, 3, 1775, 184.0, 460.0, 548.5, 719.0, 7.967514162949177, 12.60485639060319, 1.1904586591125235], "isController": false}, {"data": ["GET /cart.html", 4677, 2504, 53.538593115244815, 311.5396621766083, 1, 3305, 22.0, 955.1999999999998, 1112.0999999999995, 1839.4800000000087, 15.906107373876845, 4202.314175936656, 4.383199275051184], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 2329, 140, 6.011163589523401, 380.0820094461144, 2, 2166, 361.0, 701.0, 837.5, 1504.6999999999998, 7.964952839545016, 3854.771724449481, 1.1331599674339787], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 2329, 139, 5.968226706741091, 221.46200085873755, 2, 1679, 185.0, 462.0, 564.5, 1017.699999999998, 7.967595934439241, 113.28223221188878, 1.0389396366516255], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 13758, 94.65428276573788, 19.43687043499145], "isController": false}, {"data": ["Non HTTP response code: java.net.BindException", 2, 0.013759889920880633, 0.0028255372052611505], "isController": false}, {"data": ["Assertion failed", 775, 5.331957344341245, 1.0948956670386958], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 70783, 14535, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 13758, "Assertion failed", 775, "Non HTTP response code: java.net.BindException", 2, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GET /inventory-item.html-3", 2333, 145, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 145, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["05 Checkout Step One", 23, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-1", 2333, 137, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 137, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-2", 2333, 133, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 133, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-1", 2416, 116, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 116, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)-2", 2416, 127, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 127, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["03 Inventory Item (product details)", 27, 2, "Non HTTP response code: java.net.BindException", 1, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)-3", 2416, 130, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 130, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)", 4769, 2493, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 2353, "Assertion failed", 140, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html", 4703, 2534, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 2370, "Assertion failed", 164, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html", 4729, 2510, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 2357, "Assertion failed", 153, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-3", 2372, 139, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 139, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["01 Login", 37, 2, "Non HTTP response code: java.net.BindException", 1, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-2", 2372, 135, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 135, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-1", 2372, 129, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 129, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html", 4651, 2484, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 2322, "Assertion failed", 162, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 2329, 141, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 141, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-3", 2326, 140, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 140, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html-2", 2326, 127, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 127, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-1", 2326, 127, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 127, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html", 4677, 2504, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 2351, "Assertion failed", 153, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 2329, 140, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 140, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 2329, 139, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 139, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
