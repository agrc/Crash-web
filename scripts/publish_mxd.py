import arcpy
import sys
import xml.dom.minidom as DOM

arcpy.env.overwriteOutput = True
temp_dir = 'c:/temp/'

temp_info = {
    'draft_location':  temp_dir + 'service.sddraft',
    'sd_location': temp_dir + 'service.sd'
}

mxd_info = {
    'service': 'Crashes',
    'folder': 'Crash',
    # 'mxd': arcpy.mapping.MapDocument('C:/Projects/GitHub/Crash-web/maps/dev.mxd'),
    # 'connection': 'C:/Projects/GitHub/Crash-web/scripts/connections/dev.ags',
    'mxd': arcpy.mapping.MapDocument('C:/Projects/GitHub/Crash-web/maps/test.mxd'),
    'connection': 'C:/Projects/GitHub/Crash-web/scripts/connections/test.ags',
    'summary': 'A map containing vehicle collision points'
}


def print_errors(errors):
    for key in ('messages', 'warnings', 'errors'):
        vars = errors[key]
        if len(vars) == 0:
            continue

        print '[{}]'.format(key)
        for ((message, code), layerlist) in vars.iteritems():
            print '-{} ({})'.format(message, code)

            layers = map(lambda x: x.name, layerlist)
            if len(layers) > 0:
                print '-applies to: {}'.format(', '.join(layers))

    if len(errors['errors']) > 0:
        sys.exit('Quitting do to errors')


def modify_sd_for_replacement(sddraft):
    # To modify pooling and capabilities you have to do this
    newType = 'esriServiceDefinitionType_Replacement'
    xml = sddraft
    doc = DOM.parse(xml)
    descriptions = doc.getElementsByTagName('Type')
    for desc in descriptions:
        if desc.parentNode.tagName == 'SVCManifest':
            if desc.hasChildNodes():
                desc.firstChild.data = newType
    outXml = xml
    f = open(outXml, 'w')
    doc.writexml(f)
    f.close()


def create_sd_draft():
    print 'Creating the service definition draft.'
    errors = arcpy.mapping.CreateMapSDDraft(
        map_document=mxd_info['mxd'],
        out_sddraft=temp_info['draft_location'],
        service_name=mxd_info['service'],
        server_type='ARCGIS_SERVER',
        # connection_file_path=mxd_info['connection'],
        copy_data_to_server=False,
        folder_name=mxd_info['folder'],
        summary=mxd_info['summary'],
        tags=None)

    print_errors(errors)


def analyze_sd():
    print 'Analyzing the service definition.'
    errors = arcpy.mapping.AnalyzeForSD(temp_info['draft_location'])

    print_errors(errors)


def stage_service():
    print 'Staging the service.'
    arcpy.StageService_server(temp_info['draft_location'], temp_info['sd_location'])


def upload_to_server():
    success = True
    print 'Uploading the service definition'
    try:
        arcpy.UploadServiceDefinition_server(
            in_sd_file=temp_info['sd_location'],
            in_server=mxd_info['connection'],
            in_startupType='STARTED')
    except arcpy.ExecuteError as e:
        if '001398' in e.message:
            success = False
            print 'Service already exists.'
        else:
            print e

    #: remove this to overwrite mxd
    sys.exit()

    if not success:
        print 'Modifying sd and trying again.'
        create_sd_draft()
        modify_sd_for_replacement(temp_info['draft_location'])
        stage_service()
        upload_to_server()


if __name__ == '__main__':
    create_sd_draft()
    # analyze_sd()  # this seems to create the same output as the create sd draft
    stage_service()
    upload_to_server()

    print 'Done.'
    print arcpy.GetMessages()
