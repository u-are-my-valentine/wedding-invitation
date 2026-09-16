#import <AppKit/AppKit.h>
#import <CoreText/CoreText.h>
void line(NSString *text, CGFloat y, NSFont *font, CGFloat spacing) {
 NSMutableParagraphStyle *style=[NSMutableParagraphStyle new];style.alignment=NSTextAlignmentCenter;
 [text drawInRect:NSMakeRect(55,y,650,font.pointSize*1.7) withAttributes:@{NSFontAttributeName:font,NSForegroundColorAttributeName:[NSColor colorWithCalibratedRed:53./255 green:53./255 blue:49./255 alpha:1],NSParagraphStyleAttributeName:style,NSKernAttributeName:@(spacing)}];
}
int main(int argc,char **argv) {@autoreleasepool {
 NSString *root=[NSString stringWithUTF8String:argv[1]];
 for(NSString *file in @[@"CutiveMono-Regular.ttf",@"NanumMyeongjo-Regular.ttf"]){ NSURL *url=[NSURL fileURLWithPath:[root stringByAppendingFormat:@"/public/fonts/%@",file]];CTFontManagerRegisterFontsForURL((__bridge CFURLRef)url,kCTFontManagerScopeProcess,NULL); }
 NSBitmapImageRep *bitmap=[[NSBitmapImageRep alloc] initWithBitmapDataPlanes:NULL pixelsWide:1200 pixelsHigh:630 bitsPerSample:8 samplesPerPixel:4 hasAlpha:YES isPlanar:NO colorSpaceName:NSDeviceRGBColorSpace bytesPerRow:0 bitsPerPixel:0];
 [NSGraphicsContext saveGraphicsState];[NSGraphicsContext setCurrentContext:[NSGraphicsContext graphicsContextWithBitmapImageRep:bitmap]];
 [[NSColor colorWithCalibratedRed:244./255 green:243./255 blue:239./255 alpha:1] setFill];NSRectFill(NSMakeRect(0,0,1200,630));
 NSImage *paper=[[NSImage alloc] initWithContentsOfFile:[root stringByAppendingString:@"/public/images/location/invitation-paper.png"]];
 for(int x=0;x<1200;x+=132)for(int y=0;y<630;y+=132)[paper drawInRect:NSMakeRect(x,y,132,132) fromRect:NSZeroRect operation:NSCompositingOperationSourceOver fraction:.35];
 NSImage *photo=[[NSImage alloc] initWithContentsOfFile:[root stringByAppendingString:@"/public/images/wedding/0100.webp"]];
 if(!photo){fprintf(stderr,"Photo load failed\n");return 1;}
 [photo drawInRect:NSMakeRect(760,50,370,530) fromRect:NSMakeRect(170,545,1260,1805) operation:NSCompositingOperationSourceOver fraction:1];
 NSFont *latin=[NSFont fontWithName:@"CutiveMono-Regular" size:24];NSFont *korean=[NSFont fontWithName:@"NanumMyeongjo" size:48];
 if(!latin || !korean){fprintf(stderr,"Font load failed\n");return 2;}
 line(@"THE WEDDING OF",440,latin,2);line(@"정연수 & 곽재현",310,korean,3);line(@"FEBRUARY 14, 2027",230,latin,1);line(@"PM 12:30",177,latin,1);line(@"드레스가든",104,[NSFont fontWithName:@"NanumMyeongjo" size:27],3);
 [[NSGraphicsContext currentContext] flushGraphics];[NSGraphicsContext restoreGraphicsState];
 NSData *png=[bitmap representationUsingType:NSBitmapImageFileTypePNG properties:@{}];[png writeToFile:[root stringByAppendingString:@"/public/og.png"] atomically:YES];
 NSLog(@"Rendered original photo thumbnail");
}return 0;}
