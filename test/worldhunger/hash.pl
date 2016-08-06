my $code = "p";
my $sum = 0;
for(my $i=0;$i<length($code);$i++){
	my $char = substr($code, $i, 1);
	$sum = ($sum << 2) . (ord($char)*3267000013)%29497513910652490397;
}
		printf("%u\n",$sum);
print length($code) . "\n";
for(my $i=0;$i<length($code);$i++){
	$sum += (ord(substr($code, $i, 1))*71755440315342536873)%27542476619900900873;
	printf("%u\n", (ord(substr($code, $i, 1))*671998030559713968361666935769)%27542476619900900873);
}
$sum %= 71755440315342536873;
		printf("%u\n",$sum);