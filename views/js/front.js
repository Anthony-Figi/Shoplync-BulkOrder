/**
* 2007-2021 PrestaShop
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to http://www.prestashop.com for more information.
*
*  @author    PrestaShop SA <contact@prestashop.com>
*  @copyright 2007-2021 PrestaShop SA
*  @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*
* Don't forget to prefix your containers with your own identifier
* to avoid any conflicts with others containers.
*/

/* Defined ID's name used to identify certain objects */

var ListContainerName = '#ListContainer';
//The textare box used for inputing partnumbers
var partNumberListName = '#partNumberList'
//Defines the id for the warning element that is displayed to user
var noProductsInListName = '#noProductsInList';
//The heading used for the part number tables
var orderListHeadingName = '#orderListHeading';

var partsList = [];
var rejectList = [];
var recognizedTypes = [
    'text/plain', 'application/vnd.ms-excel', 'text/x-csv', 
    'application/csv','application/x-csv','text/csv',
    'text/comma-separated-values','text/x-comma-separated-values','text/tab-separated-values'
];

function AddItemsToCart(e) {
    e.preventDefault(); // avoid to execute the actual submit of the form.
    if(Array.isArray(partsList) && partsList.length > 0){
        console.log('Adding selected parts to cart.');
        for(idx in partsList)
        {
            var product = partsList[idx];
            var id_product_attribute = 0;
            if(product.hasOwnProperty('combinations') && !Array.isArray(product.combinations))
            {
                var combo = partsList[idx].combinations[Object.keys(product.combinations)[0]];
                id_product_attribute = combo.id_product_attribute;
            }
            var qty = product.hasOwnProperty('toOrder') && product.toOrder != null ? product.toOrder : 1;
            addToCart(product.id_product, id_product_attribute, qty, link_token);
        }
    }
    else 
    {
        alert('There are no items to add to cart.');
    }
}


/**
* Upload the selected file type
*/
function selectFile(theElement)
{
    var fileType = document.getElementById('file_type');
    if(fileType != null)
    {
        if(fileType.value.length > 0)
        {
            event.preventDefault(); 
            document.getElementById('getFile').click();
        }
        else
            showOutLine(fileType, true);
    }
}

function fileTypeSelected(theElement)
{
    if(theElement != null)
    {
        if(theElement.value.length > 0)
        {
            //disable regular panels
            disableTabs(true, true);
            //enable upload file tab
            $('#uploadFileList').removeClass('disabled');
            $('#uploadFileList.tabcontent input').prop('disabled', false);
            $('#uploadFileList.tabcontent button').prop('disabled', false);
        }
        else 
        {
            //remove outline & enable tabs
            showOutLine(theElement, false);
            disableTabs(false, false);
        }
    }
}

function uploadFile(theFileElement = null)
{
    if(theFileElement == null)
        theFileElement = document.getElementById('getFile');
    
    var myFile = theFileElement.files[0];
    var fileTypeCode = document.getElementById('file_type');
    var skuFormat = $("input:radio[name ='format_type']:checked").val() == 'true'  ? true : false;
    
    console.log(myFile);
    console.log(myFile.type);
    
    if((myFile.size / 1024 / 1024) > 3){
        alert('Image Exceeds Max File Size Of 3 MB');
        return;
    }
    
    if(myFile != null && isValidFileType(myFile.type, recognizedTypes) && fileTypeCode != null && fileTypeCode.value.length > 0)
    {
        console.log('Submitting File (Type:'+myFile.type+')...');
        ShowSpinner();
        
        var form_data = new FormData();
        form_data.append('ajax', true);
        form_data.append('action', 'submitBulkOrderFile');
        form_data.append('file_type_code', fileTypeCode.value);
        form_data.append('file', myFile);
        form_data.append('isSkuFormat', skuFormat);
        
        $.ajax({ 
            type: 'POST', 
            cache: false, 
            processData: false,
            contentType: false,
            //dataType: 'json', 
            url: controllerURL, 
            data: form_data, 
            success : function (data) {
                var dataObj = JSON.parse(data);
                DoAjaxSuccess(dataObj);
                disableTabs(false);
            }, 
            error : function (data){ 
                var dataObj = JSON.parse(data);
                DoAjaxFailed(dataObj);
            } 
        });
    }
    else 
    {
        $(ListContainerName).html(''); 
        $(ListContainerName).append(warningNotice);
        $(noProductsInListName).append('The selected file '+myFile.name+' is not a supported filetype. Please select a file with a comma delimited list or use the text box.');
    }
}

$('#getFile').on('change', function(e) { 
    uploadFile(this);
});

function isValidFileType(type, typeList)
{
    if(type != null && Array.isArray(typeList) && typeList.length > 0)
    {
        for(idx in typeList)
        {
            if(typeList[idx] == type){ return true;}
        }
    }
    return false;
}
/**
* Generates a POST request to add a product to the users cart
*/
function addToCart(id_product, id_product_attribute, id_quantity, static_link_token){
    if(static_link_token.length > 0)
    {
        $.post("index.php?controller=cart&update=1&id_product=" + id_product + "&id_product_attribute=" + id_product_attribute + "&qty=" + id_quantity + "&token=" + static_link_token + "&op=up", 
        function () {
            prestashop.emit('updateCart', {
                reason: 'update'
            });
            document.location.href="/cart";
        });
    }
}
/**
* Will merge arrays and update duplicate quantities
*/
function FilterDuplicateParts(baseArry, newArry)
{
    if(baseArry.length == 0)
        return newArry;
    
    var nonDuplicates = [];
    for(idx in newArry)
    {
        var isNew = true;
        for(index in baseArry)
        {
            var baseArrayReference = GetReferenceNumber(baseArry[index])[1];
            var newArrayReference = GetReferenceNumber(newArry[idx])[1];
            
            if(baseArry[index].reference == newArry[idx].reference 
            ||  (baseArrayReference.length > 0 && newArrayReference.length > 0 && baseArrayReference == newArrayReference) )
            {
                baseArry[index].toOrder += newArry[idx].toOrder;
                isNew = false;
                break;
            }
        }
        if(isNew)
        {
            console.log('not found')
            console.log(newArry[idx]);
            nonDuplicates.push(newArry[idx]);
        }

    }
    console.log('NonDup');
    console.log(nonDuplicates);
    return baseArry.concat(nonDuplicates);
}
function DoAjaxSuccess(data)
{
    if(data != null)
    {
        console.log(data);
        $(ListContainerName).html('');
        
        disableTabs(false, false);
        
        var backupPartsList = partsList;
        var backupRejectList = rejectList;
        
        //filter out duplicates
        partsList = FilterDuplicateParts(backupPartsList, data[0]);
        rejectList = rejectList.concat(data[1]);
        
        ShowRejects(ListContainerName, rejectList);  
        GenerateList(ListContainerName, partsList);
    }
}
function DoAjaxFailed(data)
{
    if(data != null)
    {
        console.log(data); 
        showMessage('Failed to load product or received no response from the server. Please try again later.', true);
    }
}

var spinner = '<div class="loading"><div class="spinner"></div><br><br><h1>Submitting Parts List...</h1></div>';
function ShowSpinner()
{
    $(ListContainerName).html('');
    $(ListContainerName).append(spinner);
}

function DoManualInput(skuFormat = true)
{
    var partNumbersElements = document.querySelectorAll('input[name^=partNumbers]');
    var partNumbers = [];
    var emptyFields = 0;
    for(let idx = 0; idx < partNumbersElements.length; idx++)
    {
        if(partNumbersElements[idx].value.trim() === '')
            emptyFields++;    
        
        partNumbers.push(partNumbersElements[idx].value.trim());
    }
    
    if(emptyFields >= partNumbersElements.length)
    {
        alert('List cannot be empty. Please enter SKU/MPN values to submit or upload a file.');
        partNumbersElements[0].focus();
        return;
    }
    
    var partQtyElements = document.querySelectorAll('input[name^=partQty]');
    var partQty = [];
    for(let idx = 0; idx < partQtyElements.length; idx++)
    {
        partQty.push(partQtyElements[idx].value);
    }
    
    disableTabs(true);
    ShowSpinner();
    
    $.ajax({ 
        type: 'POST', 
        cache: false, 
        dataType: 'json', 
        url: controllerURL, 
        data: { 
            ajax: true, 
            action: 'submitBulkOrderList',//lowercase with action name 
            submit_parts: partNumbers.join('|'),
            submit_qty: partQty.join('|'),
            isSkuFormat: skuFormat,
        }, 
        success : function (data) {
            DoAjaxSuccess(data);
            disableTabs(false);
        }, 
        error : function (data){ 
            DoAjaxFailed(data);
        } 
    });
}
function disableTabs(disableTabLinks = false, disablePanel = null)
{
    $("button.tablinks").attr("disabled", disableTabLinks);
    
    if(disablePanel != null)
    {
        if(disablePanel)
            $('.tabcontent').addClass('disabled');
        else
            $('.tabcontent').removeClass('disabled');
        
        $('.tabcontent textarea').prop('disabled', disablePanel);
        $('.tabcontent input').prop('disabled', disablePanel);
        $('.tabcontent button').prop('disabled', disablePanel);
        $('#submit_parts footer button').prop('disabled', disablePanel);
        $('#bulk-order section button.add-to-cart').prop('disabled', disablePanel);
        
    }
}
function DoTextBoxList(skuFormat = true)
{
    var list = $(partNumberListName).val().trim();
    console.log(list);
    
    var withQuantity = $("input:radio[name ='list_type']:checked").val() == 'true' ? true : false;
    
    $(partNumberListName).prop('disabled', true);
    disableTabs(true);
    ShowSpinner();
    
    $.ajax({ 
        type: 'POST', 
        cache: false, 
        dataType: 'json', 
        url: controllerURL, 
        data: { 
            ajax: true, 
            action: 'submitBulkOrderTextBox',//lowercase with action name 
            submit_parts: list,
            hasQuantity: withQuantity,
            isSkuFormat: skuFormat,
        }, 
        success : function (data) {
            DoAjaxSuccess(data);
            disableTabs(false);
        }, 
        error : function (data){ 
            DoAjaxFailed(data);
        } 
    });
}

$('#submit_parts').submit(function(e){
    e.preventDefault(); // avoid to execute the actual submit of the form.
    
    console.log('Submitting SKU List...');
    selectedTab = selectedTab == null ? document.getElementById('manualInput') : selectedTab;
    
    var skuFormat = $("input:radio[name ='format_type']:checked").val() == 'true' ? true : false;
    
    if(selectedTab.id == 'manualInput')
    {
        DoManualInput(skuFormat);
    }
    else if(selectedTab.id == 'textBoxList')
    {
        DoTextBoxList(skuFormat);
    }
});

var baseTable = '<table class="table table-hover wlp_bought_list" id="table_orderlist">'
    + '<thead><tr>'
    + '<th class="hidden-md-down col-lg-1 checkbox-col nopadding-right" id="orderlist-product-checkbox">&nbsp;</th>'
    + '<th class="hidden-md-down col-lg-2 orderlist-product-partNo">Part Number</th>'
    + '<th class="col-xs-7 col-lg-3 orderlist-product-desc">Items</th>'
    + '<th class="hidden-md-down col-lg-2 orderlist-product-brand"  id="orderlist-product-brand">Brand</th>'
    + '<th class="hidden-md-down col-lg-1 orderlist-product-price" id="orderlist-product-price">Price</th>'
    + '<th class="hidden-md-down col-lg-1 orderlist-product-quantity" id="orderlist-product-qty">Quantity</th>'
    + '<th class="col-lg-2 hidden-md-down orderlist-product-actions" id="orderlist-product-action">&nbsp;</th>'
    + '</tr></thead><tbody id="table_body"></tbody></table>';

var warningNotice = '<div class="alert alert-warning" id="'+noProductsInListName.replace('#', '')+'"></div>';

/**
* Checks the paramete if it is a list or string otherwise return 0
*/
function GetItemCount(list){
    if(Array.isArray(list)){
        return list.length;
    }
    else if (typeof list === 'string'){
        return list.length;
    }
    return 0;
}
/**
* Generates a table for 'found' part numbers
*/
function GenerateList(objectName = '#ListContainer', dataList){
    if(Array.isArray(dataList))
    {
        $(objectName).append('<h1 id="'+orderListHeadingName.replace('#', '')+'">Order List ('+GetItemCount(dataList)+' Items)</h1>');
        $(objectName).append(baseTable);
        
        for(idx in dataList)
        {
            $('#table_orderlist #table_body').append(CreateProductObject(dataList[idx]));
        }
    }
    else 
    {
        
        $(objectName).append(warningNotice);
        $(noProductsInListName).append('Failed to load product or received no response from the server. Please try again later.');
    }
}
/**
* Gets the products combination name and combination part number
*/
function GetSkuNumber(product)
{
    return GetReferenceNumber(product, true)[1];
}
function GetReferenceNumber(product, getSku = false){
    if(product != null && product.hasOwnProperty('combinations') && !Array.isArray(product.combinations))
    {
        var combo = product.combinations[Object.keys(product.combinations)[0]];
        var nameTxt = combo.attributes;
        var partNoTxt = getSku ? combo.combination_mpn : combo.combination_reference;
        
        return [nameTxt, partNoTxt];
    }
    return ['',''];
}
/**
* Generates a table row for a 'found' part number
*/
function CreateProductObject(product){
    if(product !== null){
        var name = product.hasOwnProperty('name') && product.name != null ? product.name : "";
        var mfgName = product.hasOwnProperty('manufacturer_name') && product.manufacturer_name != null ? product.manufacturer_name : "";
        var partNo = product.hasOwnProperty('reference') && product.reference != null ? product.reference : "";
        var mpn = product.hasOwnProperty('mpn') && product.mpn != null ? product.mpn : "";
        var price = product.hasOwnProperty('price_tax_excl') && product.price_tax_excl != null ? product.price_tax_excl : "";
        var productLink = product.hasOwnProperty('link_rewrite') && product.link_rewrite != null && product.link_rewrite.length > 0 ? product.link_rewrite : "#";
        var productImage = product.hasOwnProperty('image_small_default') && product.image_small_default != null && product.image_small_default.length > 0 ? product.image_small_default : "";
        var qty = product.hasOwnProperty('toOrder') && product.toOrder != null && product.toOrder > 0 ? product.toOrder : 1;
        
        if(/^([0-9]{1,}\.[0-9]{1})$/.test(price)){ price += '0'; }
        
        if(!(/^([0-9]{1,}\.[0-9]{2})$/.test(price))){ price += '.00'; }
        
        if(!(/^(https?:\/\/)/.test(productImage))){ productImage = 'https://'+productImage; }
        
        if(product.hasOwnProperty('combinations') && !Array.isArray(product.combinations))
        {
            var combo = GetReferenceNumber(product);
            name += ' '+combo[0];
            partNo = partNo.length > 0 ? partNo : combo[1];
            mpn = mpn.length > 0 ? mpn : GetSkuNumber(product);
            
        }
        
        var tableRow = '<tr><td class="col-xs-12 hidden-md col-lg-1 checkbox-col nopadding-right"><img src="'+productImage+'" alt="'+name.trim()+'"></td>'
            + '<td class="col-xs-12 col-md-3 col-lg-2 checkbox-col orderlist-product-partNo"><p>MPN: <span class="product_partNo">'+partNo+'</span></p><p>SKU: <span class="product_sku">'+mpn+'</spam></p></td>'
            + '<td class="col-xs-12 col-lg-3 checkbox-col orderlist-product-desc"><p class="product_name"><a href="'+productLink+'" target="_blank">'+name.trim()+'</a></p></td>'
            + '<td class="hidden-md-down col-lg-2 checkbox-col orderlist-product-brand"><p class="product_brand">'+mfgName+'</p></td>'
            + '<td class="col-xs-12 col-lg-1 checkbox-col orderlist-product-price">$'+price+'</td>'
            + '<td class="col-xs-4 col-sm-3 col-lg-1 checkbox-col orderlist-product-quantity"><input type="number" class="orderlist_product_qty" value="'+qty+'" min="1" onclick="UpdateQuantity(this)" required></td>'
            + '<td class="col-xs-12 col-lg-2 checkbox-col orderlist-product-actions">'
            + '<button class="btn btn-primary form-control-submit float-xs-right float-md-left" onclick="DeleteRow(this)">Remove</button></td></tr>';

        return tableRow;
    }
}
/**
* Generates a table for 'rejected' part numbers
*/
function ShowRejects(objectName = '#ListContainer', dataList){
    if(Array.isArray(dataList) && dataList.length > 0)
    {
        $(objectName).append('<h1>Reject List ('+GetItemCount(dataList)+' Items)</h1>');
        $(objectName).append(baseTable.replace('table_orderlist', 'table_rejectlist').replace('table_body', 'table_body2'));
        $('#table_rejectlist #orderlist-product-checkbox').remove();
        $('#table_rejectlist #orderlist-product-price').remove();
        $('#table_rejectlist #orderlist-product-qty').remove();
        $('#table_rejectlist #orderlist-product-action').remove();

        for(idx in dataList)
        {
            $('#table_rejectlist #table_body2').append(CreateRejectObject(dataList[idx]));
        }
    }
}
/**
* Generates a table row for a 'rejected' part number
*/
function CreateRejectObject(reject){
    if(reject !== null){
        var partNo = reject.hasOwnProperty('reference') ? reject.reference : "";
        
        var tableRow = '<tr>'
            + '<td class="col-xs-5 col-lg-2 checkbox-col orderlist-product-partNo"><p class="product_partNo">'+partNo+'</p></td>'
            + '<td class="col-xs-7 col-lg-3 checkbox-col orderlist-product-desc"><p class="product_name">Item Not Found In Our System</p></td>'
            + '<td class="hidden-md-down col-lg-7 checkbox-col orderlist-product-brand"><p class="product_name">Unknown</p></td>'

        return tableRow;
    }    
}
/**
* Called every time a row's 'delete' button is clicked
*/
function DeleteRow(currentRow){
    var rowElement = currentRow.parentElement.parentElement;
    var partNoElement = rowElement == null ? null : rowElement.querySelector('.product_partNo');
    if(partNoElement != null && partsList.length > 0)
    {
        for(idx in partsList)
        {
            console.log('Delete Selected Row');
            if(partsList[idx].reference == partNoElement.innerHTML || GetReferenceNumber(partsList[idx])[1] == partNoElement.innerHTML)
            {
                partsList.splice(idx, 1);//overwrites original array
                rowElement.remove();
                $(orderListHeadingName).empty().append('Order List ('+GetItemCount(partsList)+' Items)');
                break;
            }
        }
    }
    if(partsList.length == 0)
    {
        $('#table_orderlist').remove();
        $(orderListHeadingName).remove();
        showMessage('There are no products to display please enter a list of comma seperated part numbers. Then click the refresh button.', false);
    }
    console.log(partsList);
}

/**
* Called every time a row's quantity input field is updated
*/
function UpdateQuantity(currentInput){
    
    var qty = currentInput.value;
    var rowElement = currentInput.parentElement.parentElement;
    var partNoElement = rowElement == null ? null : rowElement.querySelector('.product_partNo');
    if(partNoElement != null && partsList.length > 0){
        console.log('Update Quantity: '+partNoElement.innerHTML+' '+qty);
        for(idx in partsList)
        {
            if(partsList[idx].reference == partNoElement.innerHTML || GetReferenceNumber(partsList[idx])[1] == partNoElement.innerHTML)
            {
                qty = parseInt(qty);
                partsList[idx].toOrder = qty > 0 ? qty : 1;
                break;
            }
        }
    }
    console.log(partsList);
}

/**
* Removes outline from required file type
*/
function showOutLine(theElement, outlined = true)
{
    if(theElement != null )
    {
        if(!outlined)
        {
            theElement.classList.remove('requireOption');
        }
        else
        {    
            theElement.classList.add('requireOption');
        }          
    }
}

var selectedTab = null;
/**
* Shows/Hides tab content and adds/removes the required attributes from input
*/
function changeTab(evt, tabType) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    selectedTab = document.getElementById(tabType);
    selectedTab.style.display = "table";
    evt.currentTarget.className += " active";


    document.getElementById('partNumberList').disable = (tabType == 'manualInput');
    document.getElementById('partNumberList').required = !(tabType == 'manualInput');
}



function addPartsRow()
{
    var pnTemplate = ['<input class="form-control form-control-md d-inline-block" tabindex="', '" type="text" name="partNumbers[]" value="" maxlength="26" size="12"> \n'];
    var qtyTemplate = ['<input class="form-control form-control-md d-inline-block" tabindex="', '" type="number" name="partQty[]" value="1" min="1"> \n'];
    var lastTabIdx = document.querySelectorAll('#inputContainer input').length;
    
    if(lastTabIdx > 100)
    {
        alert('Notice: You\'ve reached the maximum allowed entries, for bigger orders please use the upload file feature.');
        return;
    }
    for(let count = 1; count <= 12; count++)
    {
        var idx = lastTabIdx + count;
        if(count % 2 == 0)
            $('#inputContainer').append(qtyTemplate[0] + idx + qtyTemplate[1]);
        else
            $('#inputContainer').append(pnTemplate[0] + idx + pnTemplate[1]);
    }
}

function showMessage(message = "", disableTabs = true)
{
    $(ListContainerName).html('');
    if(disableTabs)
        disableTabs(true, true);
    
    $(ListContainerName).append(warningNotice);
    if(message.length > 0)
        $(noProductsInListName).append(message);
}

function ClearList()
{
    showMessage('There are no products to display, please enter SKU / MPN values. Then click the add to list button.', false);
    //clear the saved array;
    partsList = rejectList = [];
}