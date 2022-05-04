<?php
/**
* @author    Anthony Figueroa - Shoplync Inc <sales@shoplync.com>
* @copyright 2007-2021 Shoplync Inc
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
* @category  PrestaShop module
* @package   Bulk Purchase Order
*      International Registered Trademark & Property of Shopcreator
* @version   1.0.0
* @link      http://www.shoplync.com/
*/

//include_once dirname(_PS_MODULE_DIR_).'/modules/BulkOrder/classes/helper.php';
/**
 * Class itself
 */
if(!class_exists('dbg'))
{
    include_once dirname(_PS_MODULE_DIR_).'/modules/BulkOrder/classes/helper.php';
    class_alias('BulkOrder_dbg', 'dbg');
}
class BulkOrderNewModuleFrontController extends ModuleFrontController
{
    /**
     * For allow SSL URL
     */
    public $ssl = true;

    /**
     * String Internal controller name
     */
    public $php_self = 'new';

    public $productList = null;
    public $productDetailsList = array();
    public $productRejectList = array();

    /**
     * Sets default medias for this controller
     */
    public function setMedia()
    {
        /**
         * Set media
         */
        parent::setMedia();
        
        $this->addCSS(__PS_BASE_URI__.'modules/'.$this->module->name.'/views/css/front.css');
        $this->addJS(__PS_BASE_URI__.'modules/'.$this->module->name.'/views/js/front.js');
        
        //Tools::addJS(__PS_BASE_URI__.'modules/'.$this->module->name.'/views/js/global.js');
        $this->addJS(_THEME_DIR_.'js/history.js');
        //Tools::addJS(_THEME_DIR_.'js/history.js');
    }

    /**
     * Redirects to canonical or "Not Found" URL
     *
     * !!!! There was not parameter which generated a "strict standards" warning
     *
     * @param string $canonical_url
     */
    public function canonicalRedirection($canonical_url = '')
    {
        //parameter added to function
        $canonical_url=null;
        if (Tools::getValue('live_edit')) {
            return $canonical_url;
        }
    }

    public function getBreadcrumbLinks()
    {
        $breadcrumb = parent::getBreadcrumbLinks();

       // $breadcrumb['links'][] = $this->addMyAccountToBreadcrumb();

        return $breadcrumb;
    }

    /**
     * Initializes controller
     *
     * @see FrontController::init()
     * @throws PrestaShopException
     */
    public function init()
    {
        $this->page_name = 'new';

        $this->display_column_left = false;
        $this->display_column_right = false;

        parent::init();
    }

    /**
     * Initializes page content variables
     */
    public function initContent()
    {
        parent::initContent();

        if ($this->context->customer->isLogged()) {
            
           // $this->initSmartyVariables();
            
             $this->context->smarty->assign('link_token', Tools::getToken(false));
            $this->setTemplate('module:BulkOrder/views/templates/front/bulkorder-input.tpl');
        } else {
            Tools::redirect('index.php');
        }
    }
    
    /**
     * Initializes smarty variables
     */    
    protected function initSmartyVariables()
    {
        if(isset($productList))
            $this->context->smarty->assign('productList', $productList);
    
        if(isset($productDetailsList))
            $this->context->smarty->assign('productDetailsList', $productDetailsList);
        
        if(isset($productRejectList))
            $this->context->smarty->assign('productRejectList', $productRejectList);
    }

    /**
     * Save form data.
     */
    public function postProcess()
    {
        return parent::postProcess(); 
    }
    /**
     * This function sets the appropritate error headers and returns the default 'Failed' error response
     * 
     * $errorMessage string - The error message to return
     * $extra_details array() - array of key:value pairs to be added to the error json response
     * 
    */
    public function setErrorHeaders($errorMessage = 'Failed', $extra_details = [])
    {
        header('HTTP/1.1 500 Internal Server Error');
        header('Content-Type: application/json; charset=UTF-8');
        
        $error_array = ['errorResponse' => $errorMessage];
        
        if(!empty($extra_details) && is_array($extra_details))
            $error_array = $error_array + $extra_details;
        
        $this->ajaxDie(json_encode($error_array));
    }
    
    
    public function displayAjaxSubmitBulkOrderFile(){
        
        $parts_file = Tools::fileAttachment('file', true);
        if (Tools::isSubmit('file_type_code') && !is_null($parts_file))
        {
            $productList = array();
            $quantityList = array();
            $returnObj = array();
            
            $useSkuFormat = Tools::isSubmit('isSkuFormat') && Tools::getValue('isSkuFormat') == "true";
            $file_type_code = Tools::getValue('file_type_code');
            dbg::m("The file ajax request has been recieved");
            
            //Check file size
            if($parts_file['size']  == 0 || ($parts_file['size'] / 1024 / 1024) > 3)
            {
                $this->setErrorHeaders('Max image size exceeded');
            }
            //check if image is correct type
            $file_type = strtolower(pathinfo('/'.$parts_file["name"],PATHINFO_EXTENSION) ?? '');
            $accepted_types = ['txt', 'csv', 'otf'];
            
            if(!in_array($file_type,$accepted_types))
            {
                $this->setErrorHeaders('File type must be one of the following: '.implode(', ', $accepted_types));
            }
            
            
            switch($file_type_code)
            {
                case 'CSV1':
                case 'CSV2':
                case 'CSV3':
                case 'CSV4':
                    $file_arr = file($parts_file["tmp_name"]);
                    $file_arr = preg_replace('/\r\n|\r|\n/', "", $file_arr);
                    
                    $quantityList = array_map(function($val) use ($file_type_code) {
                        $trimmed = Trim(Trim($val), ",");
                        $seperator = $file_type_code == 'CSV1' || $file_type_code == 'CSV2' ? ',' : "\t";
                        return explode( $seperator, $trimmed);
                    }, $file_arr);
                    
                    dbg::m('qty:'.print_r($quantityList,true));
                    if($file_type_code == 'CSV2' || $file_type_code == 'CSV4')
                    {//if qty, part-no reverse arrays
                        $quantityList = array_map(function($val) {
                            return array_reverse($val);
                        }, $quantityList);
                        dbg::m('qty2:'.print_r($quantityList,true));
                    }
                    
                    $productList = array_map(function($val) {
                        return $val[0];
                    }, $quantityList);
                    dbg::m('sku:'.print_r($productList,true));
                    break;
                case 'CSV5':
                    $strList = file_get_contents($parts_file["tmp_name"], true);
                    preg_replace('/\r\n|\r|\n/', "", $strList);
                    $strList = Trim(Trim($strList), ",");
                    $productList = explode(",", $strList);
                    break;
                default:
                    $this->setErrorHeaders('Failed to read file, unrecognized file type: '.$file_type_code);
                    break;
            };
            
            $returnObj = $this->GenerateProductList($productList, $quantityList, $useSkuFormat);
            $this->ajaxDie(json_encode($returnObj));
        }
        else 
        {
           $this->setErrorHeaders('Failed to read file');
        }
    }
    public function displayAjaxSubmitBulkOrderList() {
        if (Tools::isSubmit('submit_parts') && Tools::isSubmit('submit_qty'))
        {
            $productList = array();
            $quantityList = array();
            $returnObj = array();
            
            $strList = Tools::getValue('submit_parts');
            $strQtyList = Tools::getValue('submit_qty');
            
            $useSkuFormat = Tools::isSubmit('isSkuFormat') && Tools::getValue('isSkuFormat') == "true";
            
            $tempList = Trim(Trim($strList), ",");
            $tempList = explode("|", $strList);
            $tempQty = Trim(Trim($strQtyList), ",");
            $tempQty = explode("|", $strQtyList);
            for($idx = 0; $idx < count($tempList); $idx++)
            {
                if(!empty($tempList[$idx]))
                {
                    array_push($productList, $tempList[$idx]);
                    array_push($quantityList, [ $tempList[$idx], (empty($tempQty[$idx]) || $tempQty[$idx] == '0' ? 1 : $tempQty[$idx]) ]);
                }
            }
            
            $returnObj = $this->GenerateProductList($productList, $quantityList, $useSkuFormat);
            $this->ajaxDie(json_encode($returnObj));
        }
        else 
        {
           $this->setErrorHeaders('Failed to read parts list');
        }
    }
    public function displayAjaxSubmitBulkOrderTextBox() {
        if (Tools::isSubmit('submit_parts'))
        {
            $productList = array();
            $quantityList = array();
            $returnObj = array();
            
            $strList = Tools::getValue('submit_parts');
            
            if(isset($strList) && Tools::isSubmit('hasQuantity') && Tools::getValue('hasQuantity') == "true")
            {
               $tempList = Trim(Trim($strList), ",");
               $tempList = preg_split('/\r\n|\r|\n/', $strList);
               foreach($tempList as $item)
               {
                   array_push($quantityList, explode(",", $item));
               }
               foreach($quantityList as $itemArray)
               {
                   array_push($productList, $itemArray[0]);
               }
            }
            
            $useSkuFormat = Tools::isSubmit('isSkuFormat') && Tools::getValue('isSkuFormat') == "true";
            
            if(isset($strList))
            {
                $strList = Trim(Trim($strList), ",");
                $productList = empty($productList) ? explode(",", $strList) : $productList;
                $returnObj = $this->GenerateProductList($productList, $quantityList, $useSkuFormat);
            }
            $this->ajaxDie(json_encode($returnObj));
        }
        else 
        {
           $this->setErrorHeaders('Failed to read parts list');
        }
    }

    protected function GenerateProductList($productList, $quantityList = [], $useSkuFormat = true)
    {
        if(empty($productList))
            return array();
        
        $productDetailsList = array();
        $productRejectList = array();
        
        foreach($productList as $sku)
        {
            $sku = Trim($sku);
            $result = $this->searchProducts($sku, true, $useSkuFormat);
            if(is_array($result) && isset($result['notfound']))
            {
                dbg::m("NOT FOUND |".$sku."|");
                //part not found add to rejectList
                $sku_obj = new stdClass();
                $sku_obj->reference = $sku;
                $sku_obj->prestashopProduct = false;
                
                array_push($productRejectList, $sku_obj);
            }
            else if(is_array($result) && isset($result['found']) && $result['found'])
            {
                dbg::m("FOUND |".$sku."|");
                array_push($productDetailsList, empty($quantityList) ? $result['products'][0] : $this->LookForQuantity($result['products'][0], $quantityList) );
            }
        }
        $returnObj = array();
        array_push($returnObj, $productDetailsList);
        array_push($returnObj, $productRejectList);
        
        return $returnObj;
    } 

    protected function LookForQuantity($product, $qtyList)
    {
        if(isset($product) && $product != null && isset($qtyList) && !empty($qtyList))
        {
            foreach($qtyList as $skuName)
            {
                if($product['reference'] == $skuName[0] || reset($product['combinations'])['combination_reference'] == $skuName[0] 
                    || $product['mpn'] == $skuName[0] || reset($product['combinations'])['combination_mpn'] == $skuName[0])
                {
                    $qty = intval($skuName[1]);
                    $product['toOrder'] = $qty != null && $qty > 0 ? $qty : 1;
                    return $product;
                }
            }
        }
        return $product;
    }
    /*
    *
    * Forked From https://github.com/PrestaShop/PrestaShop/blob/develop/controllers/admin/AdminCartRulesController.php
    *
    **/    
    protected function searchProducts($search, $strict = false, $skuOnly = false)
    {
        $products;
        if($strict)
        {
            $products = $this->searchByNameStrict((int) $this->context->language->id, $search, null, null, $skuOnly);
        }
        else
        {
            $products = Product::searchByName((int) $this->context->language->id, $search);
        }
        
        if ($products) {
            foreach ($products as &$product) {
                $combinations = [];
                $productObj = new Product((int) $product['id_product'], false, (int) $this->context->language->id);
                $attributes = $productObj->getAttributesGroups((int) $this->context->language->id);
                $product['formatted_price'] = $product['price_tax_incl']
                    ? $this->context->getCurrentLocale()->formatPrice(Tools::convertPrice($product['price_tax_incl'], $this->context->currency), $this->context->currency->iso_code)
                    : '';
                    
                $product['link_rewrite'] = $productObj->link_rewrite == null ? '' : Context::getContext()->shop->getBaseURL(true).$productObj->link_rewrite;
                
                // Get cover image for your product
                $image = Image::getCover((int) $product['id_product']);
                $link = new Link();
                $imagePath = $productObj->link_rewrite == null ? null : $link->getImageLink($productObj->link_rewrite[Context::getContext()->language->id], $image['id_image'], 'small_default');
                
                $product['image_small_default'] = $imagePath == null ? '' : $imagePath;   
                
                foreach ($attributes as $attribute) {
                    if($attribute['reference'] == $search)
                    {
                        if (!isset($combinations[$attribute['id_product_attribute']]['attributes'])) {
                            $combinations[$attribute['id_product_attribute']]['attributes'] = '';
                        }
                        dbg::m('attribute: '.print_r($attribute, true));
                        $combinations[$attribute['id_product_attribute']]['attributes'] .= $attribute['attribute_name'] . ' - ';
                        $combinations[$attribute['id_product_attribute']]['id_product_attribute'] = $attribute['id_product_attribute'];
                        $combinations[$attribute['id_product_attribute']]['default_on'] = $attribute['default_on'];
                        $combinations[$attribute['id_product_attribute']]['combination_reference'] = $attribute['reference'];
                        $combinations[$attribute['id_product_attribute']]['combination_mpn'] = $attribute['mpn'];
                        if (!isset($combinations[$attribute['id_product_attribute']]['price'])) {
                            $price_tax_incl = Product::getPriceStatic((int) $product['id_product'], true, $attribute['id_product_attribute']);
                            $combinations[$attribute['id_product_attribute']]['formatted_price'] = $price_tax_incl
                                ? $this->context->getCurrentLocale()->formatPrice(Tools::convertPrice($price_tax_incl, $this->context->currency), $this->context->currency->iso_code)
                                : '';
                        }
                    }
                }
                if(!empty($combinations))
                {
                    foreach ($combinations as &$combination) {
                        $combination['attributes'] = rtrim($combination['attributes'], ' - ');
                    }
                }

                $product['combinations'] = $combinations;
                $product['prestashopProduct'] = true;
                $product['toOrder'] = 1;
            }
        
            return [
                'products' => $products,
                'found' => true,
            ];
        } else {
            return ['found' => false, 'notfound' => $this->trans('No product has been found.', [], 'Admin.Catalog.Notification')];
        }
    }

    /**
     * Admin panel product search. (Renmamed searchByName -> searchByNameStrict)
     * instead of using the sql 'LIKE' qualifier it uses '=' to be more precise
     *
     * @param int $id_lang Language identifier
     * @param string $query Search query
     * @param Context|null $context Deprecated, obsolete parameter not used anymore
     * @param int|null $limit
     *
     * @return array|false Matching products
     *
     * Forked from https://github.com/PrestaShop/PrestaShop/blob/6f95f94dcc41858629c43f0f099f4beede68ac67/classes/Product.php#L4855
     *
     */
    public function searchByNameStrict($id_lang, $query, Context $context = null, $limit = null, $skuOnly = false)
    {
        if ($context !== null) {
            Tools::displayParameterAsDeprecated('context');
        }
        $sql = new DbQuery();
        $sql->select('p.`id_product`, pl.`name`, p.`ean13`, p.`isbn`, p.`upc`, p.`mpn`, p.`active`, p.`reference`, m.`name` AS manufacturer_name, stock.`quantity`, product_shop.advanced_stock_management, p.`customizable`');
        $sql->from('product', 'p');
        $sql->join(Shop::addSqlAssociation('product', 'p'));
        $sql->leftJoin(
            'product_lang',
            'pl',
            'p.`id_product` = pl.`id_product`
            AND pl.`id_lang` = ' . (int) $id_lang . Shop::addSqlRestrictionOnLang('pl')
        );
        $sql->leftJoin('manufacturer', 'm', 'm.`id_manufacturer` = p.`id_manufacturer`');
        
    
        if($skuOnly)
        {
            $where = 'p.`mpn` = \'' . pSQL($query) . '\'';
        }
        else 
        {
            $where = /*'pl.`name` = \'' . pSQL($query) . '\'
            OR p.`ean13` = \'' . pSQL($query) . '\'
            OR p.`isbn` = \'' . pSQL($query) . '\'
            OR p.`upc` = \'' . pSQL($query) . '\'
            OR p.`mpn` = \'' . pSQL($query) . '\'
            OR */
            'p.`reference` = \'' . pSQL($query) . '\'
            OR p.`supplier_reference` = \'' . pSQL($query) . '\'
            OR EXISTS(SELECT * FROM `' . _DB_PREFIX_ . 'product_supplier` sp WHERE sp.`id_product` = p.`id_product` AND `product_supplier_reference` = \'' . pSQL($query) . '\')';
        }


        $sql->orderBy('pl.`name` ASC');

        if ($limit) {
            $sql->limit($limit);
        }

        if (Combination::isFeatureActive()) {
            if($skuOnly)
            {
                $where .= ' OR EXISTS(SELECT * FROM `' . _DB_PREFIX_ . 'product_attribute` `pa` WHERE pa.`id_product` = p.`id_product` AND pa.`mpn` = \'' . pSQL($query) . '\')';
            }
            else 
            {
                $where .= ' OR EXISTS(SELECT * FROM `' . _DB_PREFIX_ . 'product_attribute` `pa` WHERE pa.`id_product` = p.`id_product` AND (pa.`reference` = \'' . pSQL($query) . '\'
                OR pa.`supplier_reference` = \'' . pSQL($query) . '\''
                /*OR pa.`ean13` = \'' . pSQL($query) . '\'
                OR pa.`isbn` = \'' . pSQL($query) . '\'
                OR pa.`mpn` = \'' . pSQL($query) . '\'
                OR pa.`upc` = \'' . pSQL($query) . '\*/.'))';
            }
        }
        
        $sql->where($where);
        $sql->join(Product::sqlStock('p', 0));

        $result = Db::getInstance()->executeS($sql);

        if (!$result) {
            return false;
        }

        $results_array = [];
        foreach ($result as $row) {
            $row['price_tax_incl'] = Product::getPriceStatic($row['id_product'], true, null, 2);
            $row['price_tax_excl'] = Product::getPriceStatic($row['id_product'], false, null, 2);
            $results_array[] = $row;
        }

        return $results_array;
    }



}
